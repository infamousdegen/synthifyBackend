//@todo: FIx duplicate transactions

import { Record,Principal,$update,Result, CallResult,ic, Service, serviceUpdate, $query,nat, float64,nat32, float32,match,Vec,blob, nat64 } from "azle";
import { initDate,VaultStorageData,IndividualVaultData,VaultStateData } from "./types";
import { VaultStorage,IndividualVaultStorage,UserVaultIdMapping } from "./storage";
import {TransferError} from "../synthsBase/types"
import {calculateNewAccumulator} from './helpers'

import {ICRC,ICRCTransferError} from 'azle/canisters/icrc'
import { padPrincipalWithZeros } from "../synthsBase/helper";


//This means that 1 tokens = 1*10^8
const decimalplaces:nat = 8n

// const CollateralPrincipal:Principal = Principal.fromText("")

// const DebtTokenPrincipal: Principal = Principal.fromText("")


class Oracle extends Service {
    @serviceUpdate
    getBTCUSDT:() => CallResult<string>

}

class DepositModule extends Service {
    @serviceUpdate
    getBalance:(of:Principal) => CallResult<nat>

    @serviceUpdate
    transferToVault:(from:Principal,vaultId:nat,_VaultManagerAddress:Principal,amount:nat) => CallResult<Result<nat,ICRCTransferError>>
}

class SynthMinter extends Service {
    @serviceUpdate
    mintToken:(amount:nat,account:Principal,subAccount:blob) => CallResult<Result<nat,TransferError>>
}

const SynthMinterCanister = new SynthMinter(
    Principal.fromText("")
)

const oracleCanister = new Oracle(
    Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai"))

const DepositModuleCanister = new DepositModule(
    Principal.fromText("")
)

$update;
export function init(InitData:VaultStorageData):Result<string,string>{
    VaultStorage.insert(1n,InitData)
    return Result.Ok<string,string>("Done")

}

//this is used to create empty Vault 
//@param: For this user to enter any blob if necessary
$update;
export function createVault(memo:blob):nat{


    const currentState:VaultStorageData =  match(VaultStorage.get(1n),{
        Some:(args) => {
            return(args)
        },
        None:() => ic.trap("Some error occured")
    })

   const currentVaultIds:Vec<nat> = match(UserVaultIdMapping.get(ic.caller()),{
    Some:(args) => {
        return (args)
    },
    None:() => ic.trap("Some Error occured")
   })

   const nextVaultId = currentState.vaultCounter + 1n
   

    const IndiVidiualVaultData:IndividualVaultData = {
        normalisedDebt:0,
        VaultCreationTime: ic.time(),
        primaryOwner: ic.caller(),
        vaultCollaterisationRatio:0,
        vaultCurrentCollateral:0,
        vaultId:nextVaultId,
        isActive:false,
        memo:memo,
        vaultLtvRatio:Infinity
    }

    IndividualVaultStorage.insert(nextVaultId,IndiVidiualVaultData)

    const updatedVaultIds:Vec<nat> = [...currentVaultIds,nextVaultId]
    UserVaultIdMapping.insert(ic.caller(),updatedVaultIds)



    const UpdateTransaction:Vec<IndividualVaultData> = [...currentState.Transactions,IndiVidiualVaultData]
    const updateVaultData:VaultStorageData = {
        ...currentState,
        Transactions:UpdateTransaction
    }
    
    VaultStorage.insert(1n,updateVaultData)
    return(nextVaultId)


}

//@note: ANyonne can 
//@note: check for vaultId has to exist 
//@todo: Don't forget to add new accumulator to the storage 

//@note: Vault collaterisation rate is not update only the vault ltv ratio is update 
//@todo: Add the transaction to transactionld 
//Todo; Vault collateral should be in how much in $value not in ckbtc amount
$update;
export async function addCollateral(_vaultId:nat,collateralAmount:nat):Promise<Result<nat,string>>{
    const Caller:Principal = ic.caller()
    
    const decimalAdjustCollateral:float64 = adjustDecimals(collateralAmount)

    const collateralAmountInDollars = await collateralAmountInDolalr(decimalAdjustCollateral)

    const currentLedgerTime = ic.time()

    const currentVaultData = match ( IndividualVaultStorage.get(_vaultId),{
        Some(arg) { 
            return arg
        },
        None:() => ic.trap("Please create a vault  before you add collateral")
    })

    const currentStateData = match(VaultStorage.get(1n),{
        Some(arg) {
            return arg
        },
        None:() => ic.trap("Error occured while query state data ")
    })

    const Balance = match(await DepositModuleCanister.getBalance(Caller).call(),{
        Ok(arg) {
            return arg
        },
        Err() {
            ic.trap("Some error occured when fetching balance ")
        },

    })
    //@todo: Test this not sure if this comparison is correct
    //1) Should compare it without decimal adjusting it 
    //2) Should I compatre the dollar value 
    //3) SHould I comapre with decimal adjust it 
    if(Balance<collateralAmount){
        ic.trap("You do not have sufficient balance please deposit using Deposit Page")
    }

    const result = match(await DepositModuleCanister.transferToVault(ic.caller(),_vaultId,ic.id(),collateralAmount).call(),{
        Ok(arg) {
            return arg
        },
        Err(arg) {
            ic.trap(arg)
        },
    })
    

    const inBalance:nat = match(result,{
        Ok(arg) {
            return arg
        },
        Err(arg) {
            ic.trap(`${arg}`)
        },
    })

    if(inBalance!=collateralAmount){
        ic.trap("Transferred Amount to Vault is not equal to entered Amount ")

        
    }

    const currentAccumulator:float64 = currentStateData.VaultStateData.currentAccumulatorValue
    const interestPerSecond:float64 = currentStateData.VaultStateData.interestPerSecond
    const timeinSeconds:nat32 = convertNanoToSec(currentLedgerTime) - currentStateData.VaultStateData.lastAccumulatorUpdateTime_seconds
    const newAccumulatorValue:float64 = calculatenewAccumulator(currentAccumulator,interestPerSecond,timeinSeconds)

    const currentNormalisedDebt:float64 = currentVaultData.normalisedDebt

    const currentVaultActualDebt:float64 = currentNormalisedDebt * newAccumulatorValue

    const vaultUpdatedCollateral:float64 = currentVaultData.vaultCurrentCollateral + decimalAdjustCollateral

    const updatedLtv:float64 = currentVaultActualDebt / collateralAmountInDollars

    //@sanity check to make sure ltv was update // 0.8 = 80%

    if(updatedLtv>0.8){
        ic.trap("Error in account LTV . LTV value greater than 80%")
    }

    //Update Overral Vault State 

    const newVaultStateData:VaultStateData = {
        ...currentStateData.VaultStateData,
        currentAccumulatorValue:newAccumulatorValue,
        lastAccumulatorUpdateTime_seconds: convertNanoToSec(currentLedgerTime)
    }

    const newVaultStorageData:VaultStorageData = {
        ...currentStateData,
        VaultStateData:newVaultStateData
    }

    VaultStorage.insert(1n,newVaultStorageData)

    //individual vault data 

    const newIndividualData:IndividualVaultData = {
        ...currentVaultData,
        isActive:true,
        vaultLtvRatio:updatedLtv,
        vaultCurrentCollateral:vaultUpdatedCollateral
    }

    IndividualVaultStorage.insert(_vaultId,newIndividualData)

    return(Result.Ok<nat,string>(collateralAmount))
}


//@todo: Add this transaction to the overall state transaction list 
//@todo: Update the accumulator value in state 
//@todo: Update the 
$update;
export async function borrow(_vaultId:nat,_debt:nat):Promise<nat>{


    const Caller:Principal = ic.caller()

    const currentLedgerTime = ic.time()
    //checking whether the vaultId exist 
    const currentVaultData = match ( IndividualVaultStorage.get(_vaultId),{
        Some(arg) { 
            return arg
        },
        None:() => ic.trap("Please create a vault  before you borrow")
    })

    if(currentVaultData.primaryOwner !== Caller){
        ic.trap("You are not the vault owner ")
    }

    
    const currentStateData = match(VaultStorage.get(1n),{
        Some(arg) {
            return arg
        },
        None:() => ic.trap("Error occured while query state data ")
    })
    const currentAccumulator:float64 = currentStateData.VaultStateData.currentAccumulatorValue

    const interestPerSecond:float64 = currentStateData.VaultStateData.interestPerSecond

    const timeinSeconds:nat32 = convertNanoToSec(currentLedgerTime) - currentStateData.VaultStateData.lastAccumulatorUpdateTime_seconds

    const newAccumulatorValue:float64 = calculatenewAccumulator(currentAccumulator,interestPerSecond,timeinSeconds)

    const normalisedDebt:float64 = normalizeDebt(_debt,newAccumulatorValue)

    const updatedNormalisedDebt:float64 = currentVaultData.normalisedDebt + normalisedDebt

    const currentVaultActualDebt:float64 = updatedNormalisedDebt * newAccumulatorValue

    const currentVaultCollateral:float64 = currentVaultData.vaultCurrentCollateral

    const currentCollateralInDollars:float64 = await collateralAmountInDolalr(currentVaultCollateral)

    const LTV:float64 = currentVaultActualDebt/currentCollateralInDollars

    if(LTV > 0.8){
        ic.trap("You do not enough collateral for this transaction")
    }
    const subAccount:blob = padPrincipalWithZeros(new Uint8Array())
    const result = match (await SynthMinterCanister.mintToken(_debt,Caller,subAccount).call(),{
        Ok(arg) {
            return arg
        },
        Err(arg) {
            ic.trap(arg)
        },
    })

    const mintAmount = match(result,{
        Ok(arg) {
            return(arg)
        },
        Err(arg) {
            ic.trap(`${arg}`)
        },

    
    })

    if(mintAmount != _debt){
        ic.trap("Some Error occured with miting tokens ")
    }

    const updateIndividualData:IndividualVaultData = {
        ...currentVaultData,
        normalisedDebt:updatedNormalisedDebt,
        vaultLtvRatio:LTV
    }
    IndividualVaultStorage.insert(_vaultId,updateIndividualData)

    const updatedVaultSateData:VaultStateData = {
        ...currentStateData.VaultStateData,
        currentAccumulatorValue:newAccumulatorValue,
        lastAccumulatorUpdateTime_seconds: convertNanoToSec(currentLedgerTime)
    }

    const updateVaultStorageData:VaultStorageData = {
        ...currentStateData,
        VaultStateData:updatedVaultSateData
    }

    VaultStorage.insert(1n,updateVaultStorageData)

    return(_debt)

}


$update;
//Function to get the price  from the oracle 
export async function getBtcPrice():Promise<string>{
    const currentBtcPrice = await oracleCanister.getBTCUSDT().call()
    
    if(currentBtcPrice.Ok!=undefined){
        return currentBtcPrice.Ok
    }

    return "Some Error Occured"
}


$update;
export async function collateralAmountInDolalr(amount:float64):Promise<float64>{
    const currentBtcPrice:float64  = parseFloat(await getBtcPrice())

    return(amount * currentBtcPrice)
}

//Should be entered to 15 decimal precision 
//will retu

$query;
export function calculatenewAccumulator(currentAcumulator:float64,interestPerSecond:float64,timeInSeconds:nat32):float64 {
    const newAccumulatorValue = calculateNewAccumulator(currentAcumulator,interestPerSecond,timeInSeconds)
    return (newAccumulatorValue)
}

$query;
export function normalizeDebt(debt:nat,newAccumulatorValue:float64):float64{

    //@TODO: CHANGE THESE DEFAULT VALUES
    debt = debt * BigInt(Math.pow(10,8))
    // const newAccumulatorValue:float64 = calculateNewAccumulator(1,1.0000000007829976090829093519527471510922262217819607847470,31536000)
  
    const roundedAccumulatorValue :nat  = BigInt(Math.round(newAccumulatorValue * Math.pow(10,8)))

    const normalizedDebt:float64 = Number(debt)/Number(roundedAccumulatorValue)
    // return(debt/finalValue)
    return(normalizedDebt)
    // // const divideValue:nat = BigInt((debt/newAccumulatorValue) * BigInt(10**8))
    // return(debt/newAccumulatorValue)
}

function convertNanoToSec(nanoseconds:nat):nat32 {
    return Number(nanoseconds / 1_000_000_000n);
  }

function adjustDecimals(amount:nat):float64{
    const decimals:nat = BigInt(Math.pow(10,8))
    return (Number(amount/decimals))
}