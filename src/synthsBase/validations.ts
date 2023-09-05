
import { blob, ic, nat, nat64, Opt, Principal,match } from 'azle';
import {
    Account,
    Subaccount,
    TransferArgs,
    ValidateTransferResult,
    ApproveError,
    TransferError,
    ValidateApproveResult,
    ApproveArgs,
    TransactionKind,
    State,
    Transaction,
    AllowanceKey,
    AllowanceStorageData

} from './types';

import { icrc1_balance_of,icrc2_allowance } from './queryFunctions/queryFunctions';
import { TokenState,AllowanceStorage,AccountBalance } from './storage/storage';

import { get_account_keys } from './helper';


import { is_subaccount_valid,
    is_created_at_time_in_future,is_created_at_time_too_old, 
    isValidFee,is_memo_valid,
    is_minting_account,is_anonymous,isExpectedAllowance,isExpired,isValidBalance } from './helper';



//@todo: Do something for duplicate transaction
export function validate_approve(    
    args: ApproveArgs,
    from: Account,
    currentTokenState:State,
    currentLedgerTime:nat
    ): ValidateApproveResult
    
    {

        const kind: TransactionKind = {
            Approve: null
        };

        const Caller: Account = from

        const Spender:Account = args.spender;


        let currentFee:nat = currentTokenState.fee;
    
        let permitted_drift_nanos:nat = currentTokenState.permitted_drift_nanos
    
        let  transaction_window_nanos:nat = currentTokenState.transaction_window_nanos
        
    
        const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime
    
        const oldAllowance = icrc2_allowance({account:Caller,spender:Spender})

        const currentCallerBalance = icrc1_balance_of(Caller)

    


        if(is_subaccount_valid(args.spender.subaccount)!== true){
            return {
                err:
                {
                    GenericError:{
                        error_code:0n,
                        message: 'spender.subaccoutn must be 32 bytes in length'
                    }
                }
            }
        }


        if(is_subaccount_valid(from.subaccount)!== true){
            return {
                err:
                {
                    GenericError:{
                        error_code:0n,
                        message: 'from.subaccount must be 32 bytes in length'
                    }
                }
            }
        }




    

        if (isExpectedAllowance(args.expected_allowance,oldAllowance.allowance) !== true) {
            return {
                err:
                { 
                    AllowanceChanged: { current_allowance: oldAllowance.allowance } 
                
                }
                
            };
        }



        if(isValidFee(args.fee) !== true){
            return {
                err:
                {
                    //@ts-ignore
                    BadFee:{expected_fee: currentFee}
                }
            }
        }

        //@ts-ignore
        currentFee = args.fee.Some ?? currentFee;


        if(isExpired(args.expires_at)){
            return{
                err:
                {
                    Expired:{ledger_time:currentLedgerTime}
                }
            }
        }

        //@ts-ignore
        if(is_created_at_time_in_future(currentLedgerTime,finalCreateTime,permitted_drift_nanos)){
            return {
                err:
                {
                    CreatedInFuture:{ledger_time:currentLedgerTime}
                }
            }  
        }


        //@ts-ignore
        if(is_created_at_time_too_old(currentLedgerTime,finalCreateTime,transaction_window_nanos,permitted_drift_nanos)){
            return {
                err:
                {
                    TooOld:null
                }
            
            }
        
        }


        if((isValidBalance(Caller,currentFee) !== true)){
            return{
                err:
                {
                    InsufficientFunds:{balance:currentCallerBalance}
                }
            }
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
                allowance:args.amount,
                expires_at:args.expires_at

            },

            fee:currentFee,

            memo: args.memo,
            created_at_time:finalCreateTime

        }

        const newTransaction:Transaction = {
            args: Opt.Some( args),
            fee: currentFee,
            from: Opt.Some(Caller),
            kind: kind,
            timestamp: finalCreateTime

        }

        const newSate:State = {
            ...currentTokenState,
            //@ts-ignore
            transactions: [...currentTokenState.transactions,newTransaction]
        }

    

        const newCallerBalance = currentCallerBalance - currentFee

        TokenState.insert(1n,newSate)

        AllowanceStorage.insert(Key,insertionData)

        AccountBalance.insert(Caller,newCallerBalance)
        

        if(currentTokenState.minting_account.Some){
            const mintingAccountBalance = icrc1_balance_of(currentTokenState.minting_account.Some)
            AccountBalance.insert(currentTokenState.minting_account.Some,mintingAccountBalance + currentFee)
        }


        return{
            ok:true
        }

    }









