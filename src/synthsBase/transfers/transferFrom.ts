import { ic,match,Opt,nat } from 'azle';


//@todo: Check whether the user has enough amount to trasnfer 
//@todo: Make sure the sender has enough balance (i.e  amount + fees)
import {
    Account,
    Transaction,
    TransactionKind,
    TransferFromArgs,
    TransferFromResult,
    State,
    AllowanceKey,
    Allowance,
    AllowanceStorageData
} from '../types';

import { get_account_keys } from '../helper';

import { TokenState,AccountBalance, AllowanceStorage } from '../storage/storage';
import { icrc1_balance_of, icrc2_allowance } from '../query/queryFunctions';

export function handle_transfer_from(args: TransferFromArgs, caller: Account): TransferFromResult {





    let currentTokenState:State;

    let fee:nat = 0n;

    const fromAccount:Account = args.from

    const toAccount:Account = args.to


    match(TokenState.get(1n),{
        Some:(arg) => {
            currentTokenState = arg
            fee = args.fee.Some ?? currentTokenState.fee
        },
        None:() => {
            return {
                Err: {
                    TemporarilyUnavailable:null
                }
            }
        }
    })



    const newTransaction:Transaction = {
        args: Opt.Some( args),
        fee: fee,
        from: Opt.Some(caller),
        kind: {
            TransferFrom:null
        },
        timestamp: ic.time()

    }

    const newState:State = {
        //@ts-ignore
        ...currentTokenState,
        //@ts-ignore
        total_supply:currentTokenState.total_supply - fee,
        //@ts-ignore
        transactions: [...currentTokenState.transactions,newTransaction]



    }

    TokenState.insert(1n,newState)




    const newFrombalance = icrc1_balance_of(fromAccount) - args.amount - fee

    const newTobalance = icrc1_balance_of(toAccount)  + args.amount

    //@ts-ignore
    if(currentTokenState.minting_account.Some){
        //@ts-ignore
        const newMintingAccountBalance = icrc1_balance_of(currentTokenState.minting_account.Some)
        //@ts-ignore
        AccountBalance.insert(currentTokenState.minting_account.Some,newMintingAccountBalance + fee)

    }

    AccountBalance.insert(fromAccount,newFrombalance)
    AccountBalance.insert(toAccount,newTobalance)

    const currentAllowance = icrc2_allowance({
        account:fromAccount,
        spender:caller
    })

    const newAllowance:Allowance = {allowance:currentAllowance.allowance - args.amount,expires_at:currentAllowance.expires_at}


    
    const {owner_key: from_owner_key,subaccount_key: from_subaccount_key} = get_account_keys(fromAccount)
    const {owner_key: to_owner_key,subaccount_key: to_subaccount_key} = get_account_keys(caller)

    const Key:AllowanceKey = {
     [from_owner_key] : {
         [from_subaccount_key] :   {
             [to_owner_key]:to_subaccount_key
         }
     }
    }



    match(AllowanceStorage.get(Key),{
        Some:(args) => {
            const newAllowanceData:AllowanceStorageData = {
                ...args,
                Allowance:newAllowance
            }
            AllowanceStorage.insert(Key,newAllowanceData)
        },
        None:() => {}
   })

    const transfer_result: TransferFromResult = {
        Ok: args.amount
    };

    return transfer_result;
}
