import { $query,ic,match,Result,nat, blob,Opt, $update } from "azle";
import { AllowanceStorage,TokenState } from "../storage/storage";
import { ApproveArgs,Account,ApproveError,State,AllowanceKey,Allowance,AllowanceStorageData,TransactionKind,Transaction } from "../types";
import { icrc2_allowance } from "../query/queryFunctions";
import { is_created_at_time_in_future,is_created_at_time_too_old, isValidFee, isExpired,isExpectedAllowance,isValidBalance, padSubAccount } from "../helper";

import { validate_approve } from "../validations";
import { testingisValidFee } from "../helper";
//Todo: Use memo
//@todo: Write test for this 


//@duplicate: should be form transaction id 
//@duplicate: I should check on how to give out duplicate 

//@todo: Remove caller this is just for testing 

//Result<nat,ApproveError>
$update;
export function icrc2_approve(approve_args:ApproveArgs):Result<nat,ApproveError>
{


    const Caller: Account = padSubAccount({
        owner: ic.caller(),
        subaccount: approve_args.from_subaccount
    });
    const Spender: Account = padSubAccount(approve_args.spender)


    let currentTokenState:State;
    let currentLedgerTime = ic.time()


      match(TokenState.get(1n),{
        Some:(arg)=>{
            currentTokenState = arg
            
        },
        None:() => {
            return({TemporarilyUnavailable:null})
        }
    })



    //@ts-ignore
    const validate_approval_result = validate_approve(approve_args,Caller,currentTokenState,currentLedgerTime)

    //@ts-ignore
    if( validate_approval_result.err){
        return(Result.Err<nat,ApproveError>(validate_approval_result.err))
    }


    // Final check to make sure the allowance was updated 
    const newAllowance = icrc2_allowance({account:Caller,spender:Spender})

    if(newAllowance.allowance !== approve_args.amount ){
        ic.trap(`${Result.Err<nat,ApproveError>({GenericError:{error_code:404n,message:"Current allowance != argument allowance"}})}`)
    } 

    //@ts-ignore
    return(Result.Ok<nat,ApproveError>(BigInt(currentTokenState.transactions.length)))



}

$query;
export function testingFee(fee:Opt<nat>):boolean {
    return(testingisValidFee(fee)) 

}