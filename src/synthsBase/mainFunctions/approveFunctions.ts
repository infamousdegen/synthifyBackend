import { $query,ic,match,Result,nat } from "azle";
import { AllowanceStorage,TokenState } from "../storage/storage";
import { ApproveArgs,Account,ApproveError,State,AllowanceKey } from "../types";
import { icrc2_allowance } from "../queryFunctions/queryFunctions";
import { is_created_at_time_in_future,is_created_at_time_too_old,get_account_keys } from "../helper";

//Todo: Use memo
//@todo: Write test for this 
$query;
export function icrc2_approve(approve_args:ApproveArgs):Result<nat,ApproveError> {
    const Caller: Account = {
        owner: ic.caller(),
        subaccount: approve_args.from_subaccount
    };


    let currentStateFee = 0n
    let permitted_drift_nanos = 0n
    let  transaction_window_nanos = 0n
    const Spender:Account = approve_args.spender;
    const currentAllowance = icrc2_allowance({account:Caller,spender:Spender})
    const currentLedgerTime = ic.time()

    match(TokenState.get(1n),{
        Some:(arg)=>{
             const currentState:State = arg
             currentStateFee = currentState.fee
             permitted_drift_nanos = currentState.permitted_drift_nanos
             transaction_window_nanos = currentState.transaction_window_nanos
        },
        None:() => {
            return({TemporarilyUnavailable:null})
        }
    })



    if (approve_args.expected_allowance.Some && approve_args.expected_allowance.Some !== currentAllowance.allowance) {
        return (Result.Err<nat,ApproveError>({ AllowanceChanged: { current_allowance: currentAllowance.allowance } }));
    }

    
    if(approve_args.fee.Some && approve_args.fee.Some < currentStateFee){
        return (Result.Err<nat,ApproveError>({BadFee: {expected_fee:currentStateFee}}))
    }

    if(approve_args.expires_at.Some && approve_args.expires_at.Some < currentLedgerTime){
        return (Result.Err<nat,ApproveError>({Expired:{ledger_time:currentLedgerTime}}))
    }
    if(currentAllowance.allowance === approve_args.amount){
        return (Result.Err<nat,ApproveError>({Duplicate: {duplicate_of: currentAllowance.allowance}}))
    }

    if(is_created_at_time_in_future(approve_args.created_at_time,permitted_drift_nanos)){
        return (Result.Err<nat,ApproveError>({CreatedInFuture:{ledger_time:currentLedgerTime}}))
    }

    if(is_created_at_time_too_old(approve_args.created_at_time,transaction_window_nanos,permitted_drift_nanos)){
        return (Result.Err<nat,ApproveError>({TooOld:null}))
    }

    const {owner_key: from_owner_key,subaccount_key: from_subaccount_key} = get_account_keys(Caller)
    const {owner_key: to_owner_key,subaccount_key: to_subaccount_key} = get_account_keys(Spender)
    const Key:AllowanceKey = {
     [from_owner_key] : {
         [from_subaccount_key] :   {
             [to_owner_key]:to_subaccount_key
         }
     }
    }

    AllowanceStorage.insert(Key,{allowance:approve_args.amount,expires_at:approve_args.expires_at})
    const updatedAllowance = icrc2_allowance({account:Caller,spender:Spender})

    if(updatedAllowance.allowance!== approve_args.amount ){
        ic.trap("current Allowance is not equal to required allowance")
    }

    return(Result.Ok<nat,ApproveError>(approve_args.amount))



}