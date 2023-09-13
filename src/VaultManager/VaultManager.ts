import { Record,Principal,$update,Result, CallResult,ic, Service, serviceUpdate, $query,nat, float64,nat32, float32,match,Vec,blob } from "azle";
import { initDate,VaultStorageData,IndividualVaultData } from "./types";
import { VaultStorage,IndividualVaultStorage,UserVaultIdMapping } from "./storage";

import {calculateNewAccumulator} from './helpers'

//This means that 1 tokens = 1*10^8
const decimalplaces:nat = 8n

// const CollateralPrincipal:Principal = Principal.fromText("")

// const DebtTokenPrincipal: Principal = Principal.fromText("")


class Oracle extends Service {
    @serviceUpdate
    getBTCUSDT:() => CallResult<string>
}



const oracleCanister = new Oracle(Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai"))

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
        memo:memo
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

$update;
//Function to get the price  from the oracle 
export async function getPriceFromCollateral():Promise<string>{
    const currentBtcPrice = await oracleCanister.getBTCUSDT().call()
    
    if(currentBtcPrice.Ok!=undefined){
        return currentBtcPrice.Ok
    }

    return "Some Error Occured"
}

//Should be entered to 15 decimal precision 
//will retu

$query;
export function calculatenewAccumulator(currentAcumulator:float64,interestPerSecond:float64,timeInSeconds:nat32):float64 {
    const newAccumulatorValue = calculateNewAccumulator(currentAcumulator,interestPerSecond,timeInSeconds)
    return (newAccumulatorValue)
}

$query;
export function normalizeDebt(debt:nat):float64{

    debt = debt * BigInt(Math.pow(10,8))
    const newAccumulatorValue:float64 = calculateNewAccumulator(1,1.0000000007829976090829093519527471510922262217819607847470,31536000)
  
    const roundedAccumulatorValue :nat  = BigInt(Math.round(newAccumulatorValue * Math.pow(10,8)))

    const normalizedDebt:float64 = Number(debt)/Number(roundedAccumulatorValue)
    // return(debt/finalValue)
    return(normalizedDebt)
    // // const divideValue:nat = BigInt((debt/newAccumulatorValue) * BigInt(10**8))
    // return(debt/newAccumulatorValue)
}

