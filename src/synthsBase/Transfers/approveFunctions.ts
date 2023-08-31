import { $query,ic,match,Result,nat, blob } from "azle";
import { AllowanceStorage,TokenState } from "../storage/storage";
import { ApproveArgs,Account,ApproveError,State,AllowanceKey,Allowance,AllowanceStorageData,TransactionKind } from "../types";
import { icrc2_allowance } from "../queryFunctions/queryFunctions";
import { is_created_at_time_in_future,is_created_at_time_too_old,get_account_keys, isValidFee, isExpired,isExpectedAllowance } from "../helper";

//Todo: Use memo
//@todo: Write test for this 
//@todo:update this transaction in the transaction list

//@duplicate: should be form transaction id 
//@duplicate: I should check on how to give out duplicate 
$query;
export function icrc2_approve(approve_args:ApproveArgs,memo:blob):Result<nat,ApproveError> {

    const kind: TransactionKind = {
        Approve: null
    };
    const Caller: Account = {
        owner: ic.caller(),
        subaccount: approve_args.from_subaccount
    };

    const Spender:Account = approve_args.spender;

    const currentLedgerTime = ic.time()
    
    let currentStateFee = 0n

    let permitted_drift_nanos = 0n

    let  transaction_window_nanos = 0n

    const finalCreateTime = approve_args.created_at_time.Some ? approve_args.created_at_time.Some : currentLedgerTime

    const oldAllowance = icrc2_allowance({account:Caller,spender:Spender})

    match(TokenState.get(1n),{
        Some:(arg)=>{
             currentStateFee = arg.fee
             permitted_drift_nanos = arg.permitted_drift_nanos
             transaction_window_nanos = arg.transaction_window_nanos
        },
        None:() => {
            return({TemporarilyUnavailable:null})
        }
    })


    if (isExpectedAllowance(approve_args.expected_allowance,oldAllowance.allowance)) {
        return (Result.Err<nat,ApproveError>({ AllowanceChanged: { current_allowance: oldAllowance.allowance } }));
    }

    const validateFee = isValidFee(approve_args.fee)

    if(validateFee !== true){
        return(Result.Err<nat,ApproveError>(validateFee as ApproveError))
    }

    
    if(isExpired(approve_args.expires_at)){
        return(Result.Err<nat,ApproveError>({Expired:{ledger_time:currentLedgerTime}}))
    }


    //If such a allowance already exist then it will be Duplicate of it 
    //This is wrong the amount can be same but different other paremeters
    // if(currentAllowance.allowance === approve_args.amount){
    //     return (Result.Err<nat,ApproveError>({Duplicate: {duplicate_of: currentAllowance.allowance}}))
    // }

    //If such a memo already exist then it shoould give duplicate 

    if(is_created_at_time_in_future(currentLedgerTime,finalCreateTime,permitted_drift_nanos)){
        return (Result.Err<nat,ApproveError>({CreatedInFuture:{ledger_time:currentLedgerTime}}))
    }

    if(is_created_at_time_too_old(currentLedgerTime,finalCreateTime,transaction_window_nanos,permitted_drift_nanos)){
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

    const insertionData:AllowanceStorageData = {
        Allowance:{
            allowance:approve_args.amount,
            expires_at:approve_args.expires_at

        },
        fee:currentStateFee,
        memo:memo,
        created_at_time:finalCreateTime

    }
    AllowanceStorage.insert(Key,insertionData)

    const newAllowance = icrc2_allowance({account:Caller,spender:Spender})

    if(newAllowance.allowance !== approve_args.amount ){
        ic.trap(`${Result.Err<nat,ApproveError>({GenericError:{error_code:404n,message:"Current allowance != arguement allowance"}})}`)
    }

    return(Result.Ok<nat,ApproveError>(approve_args.amount))



}