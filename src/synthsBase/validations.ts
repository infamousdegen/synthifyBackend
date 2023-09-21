
//@todo: validate duplicate of 

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
    AllowanceStorageData,
    TransferFromArgs,
    ValidateTransferFromResult,
    Allowance


} from './types';

import { icrc1_balance_of,icrc2_allowance } from './query/queryFunctions';
import { TokenState,AllowanceStorage,AccountBalance } from './storage/storage';
import { padSubAccount } from './helper';




import { is_subaccount_valid,
    is_created_at_time_in_future,is_created_at_time_too_old, 
    isValidFee,is_memo_valid,
    is_minting_account,is_anonymous,isExpectedAllowance,isExpired,isValidBalance } from './helper';
    


export function validate_transfer_from(
    args:TransferFromArgs,
    from:Account,
    currentTokenState:State,
    currentLedgerTime:nat,


):ValidateTransferFromResult{
    const unPaddedAccount:Account = from 

    const Caller: Account = padSubAccount(from)

    const From: Account = padSubAccount(args.from)

    const To: Account = padSubAccount(args.to)

    const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime

    const permitted_drift_nanos:nat = currentTokenState.permitted_drift_nanos

    const  transaction_window_nanos:nat = currentTokenState.transaction_window_nanos

    let currentFee:nat = currentTokenState.fee;

    const CallerAllowance:Allowance = icrc2_allowance(
        {
            account :From,
            spender :Caller

        
        }
    )

    if(CallerAllowance.allowance < args.amount){
        return {
            err:{
                InsufficientAllowance:{allowance:CallerAllowance.allowance}
            }
        }
    }

    if(is_subaccount_valid(Caller.subaccount)!== true){
        return {
            err:
            {
                GenericError:{
                    error_code:0n,
                    message: 'Caller.subaccount must be 32 bytes in length'
                }
            }
        }
    }

    if(is_subaccount_valid(From.subaccount)!== true){
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


    if(is_subaccount_valid(To.subaccount)!== true){
        return {
            err:
            {
                GenericError:{
                    error_code:0n,
                    message: 'to.subaccount must be 32 bytes in length'
                }
            }
        }
    }

    if(is_created_at_time_in_future(currentLedgerTime,finalCreateTime,permitted_drift_nanos)){
        return {
            err:
            {
                CreatedInFuture:{ledger_time:currentLedgerTime}
            }
        }  
    }

    if(is_created_at_time_too_old(currentLedgerTime,finalCreateTime,transaction_window_nanos,permitted_drift_nanos)){
        return {
            err:
            {
                TooOld:null
            }
        
        }
    
    }

    if(isValidFee(args.fee) !== true){
        return {
            err:
            {
                
                BadFee:{expected_fee: currentFee}
            }
        }
    }

    
    currentFee = args.fee.Some ?? currentFee;

    const FromBalance = icrc1_balance_of(From)

    if((isValidBalance(From,currentFee ,args.amount) !== true)){
        return{
            err:
            {
                InsufficientFunds:{balance:FromBalance}
            }
        }
    }

    if(is_minting_account(args.to.owner)){
        if(args.amount < currentFee){
            return {
                err: {
                    BadBurn: {
                        min_burn_amount: currentFee
                    }
                }
            };
        }

    }



    return {
        ok:true
    }



}

//@todo: is memo valid
//@todo: Check for to minting account and from minting account
//@todo: while burning make sure the burned has enough amount]
//@todo: is valid balance in transfer
export function validate_transfer(
    args:TransferArgs,
    from:Account,
    currentTokenState:State,
    currentLedgerTime:nat
):ValidateTransferResult{

    const Caller: Account = (from)

    const Spender:Account = padSubAccount(args.to);

    const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime

    const permitted_drift_nanos:nat = currentTokenState.permitted_drift_nanos

    const  transaction_window_nanos:nat = currentTokenState.transaction_window_nanos

    let currentFee:nat = currentTokenState.fee;

    const currentCallerBalance = icrc1_balance_of(Caller)

    if(is_subaccount_valid(Spender.subaccount)!== true){
        return {
            err:
            {
                GenericError:{
                    error_code:0n,
                    message: 'to.subaccount must be 32 bytes in length'
                }
            }
        }
    }

    if(is_subaccount_valid(Caller.subaccount)!== true){
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

            
            if(is_created_at_time_in_future(currentLedgerTime,finalCreateTime,permitted_drift_nanos)){
                return {
                    err:
                    {
                        CreatedInFuture:{ledger_time:currentLedgerTime}
                    }
                }  
            }
    
    
            
            if(is_created_at_time_too_old(currentLedgerTime,finalCreateTime,transaction_window_nanos,permitted_drift_nanos)){
                return {
                    err:
                    {
                        TooOld:null
                    }
                
                }
            
            }


            if(isValidFee(args.fee) !== true){
                return {
                    err:
                    {
                        
                        BadFee:{expected_fee: currentFee}
                    }
                }
            }
    
            
            currentFee = args.fee.Some ?? currentFee;


        if(is_minting_account(Spender.owner) === true){
            
        if (args.amount < currentFee) {
            return {
                err: {
                    BadBurn: {
                        min_burn_amount: currentFee
                    }
                }
            };
        }
    }
            if(is_minting_account(Caller.owner)!==true )
            if((isValidBalance(Caller,currentFee,args.amount) !== true)){
                return{
                    err:
                    {
                        InsufficientFunds:{balance:currentCallerBalance}
                    }
                }
            }

 




    return {
        ok: true
    };

}

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

        const Caller: Account = (from)

        const Spender: Account = padSubAccount(args.spender);


        let currentFee:nat = currentTokenState.fee;
    
        const permitted_drift_nanos:nat = currentTokenState.permitted_drift_nanos
    
        const  transaction_window_nanos:nat = currentTokenState.transaction_window_nanos
        
    
        const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime
    
        const oldAllowance = icrc2_allowance({account:Caller,spender:Spender})

        const currentCallerBalance = icrc1_balance_of(Caller)



    


        if(is_subaccount_valid(Spender.subaccount)!== true){
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

        
        if(is_subaccount_valid(Caller.subaccount)!== true){
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
                    
                    BadFee:{expected_fee: currentFee}
                }
            }
        }

        currentFee = args.fee.Some ?? currentFee;

        if(args.expires_at.Some){

        if(isExpired(args.expires_at.Some)){
            return{
                err:
                {
                    Expired:{ledger_time:currentLedgerTime}
                }
            }
        }
    }


        if(is_created_at_time_in_future(currentLedgerTime,finalCreateTime,permitted_drift_nanos)){
            return {
                err:
                {
                    CreatedInFuture:{ledger_time:currentLedgerTime}
                }
            }  
        }


        if(is_created_at_time_too_old(currentLedgerTime,finalCreateTime,transaction_window_nanos,permitted_drift_nanos)){
            return {
                err:
                {
                    TooOld:null
                }
            
            }
        
        }


        if((isValidBalance(Caller,currentFee,args.amount) !== true)){
            return{
                err:
                {
                    InsufficientFunds:{balance:currentCallerBalance}
                }
            }
        }
    
        

        const Key:AllowanceKey = {
            from:Caller,
            to:Spender
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
            args: {
                ApproveArgs:args
            },
            fee: currentFee,
            from: Opt.Some(Caller),
            kind: kind,
            timestamp: finalCreateTime

        }

        const newSate:State = {
            ...currentTokenState,

            transactions: [...currentTokenState.transactions,newTransaction]
        }

    

        const newCallerBalance:nat = currentCallerBalance - currentFee
        

        TokenState.insert(1n,newSate)
        

        AllowanceStorage.insert(Key,insertionData)

        AccountBalance.insert(from,newCallerBalance)

        if(currentTokenState.minting_account.Some!== undefined){
            const mintingAccountBalance = icrc1_balance_of(currentTokenState.minting_account.Some)
            AccountBalance.insert(currentTokenState.minting_account.Some,mintingAccountBalance + currentFee)
        }

        return{
            ok:true
        }

    }









