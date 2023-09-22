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


import { TokenState,AccountBalance, AllowanceStorage } from '../storage/storage';
import { icrc1_balance_of, icrc2_allowance } from '../query/queryFunctions';
import { padSubAccount } from '../helper';

export function handle_transfer_from_burn(args: TransferFromArgs, caller: Account): TransferFromResult {





    let currentTokenState:State;

    let fee:nat = 0n;

    const fromAccount:Account = padSubAccount(args.from)


    const toAccount:Account = padSubAccount(args.to)

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
        args: {
            TransferFromArgs:args
        },
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
        total_supply:currentTokenState.total_supply - fee - args.amount,
        //@ts-ignore
        transactions: [...currentTokenState.transactions,newTransaction]



    }

    TokenState.insert(1n,newState)




    const newFrombalance = icrc1_balance_of(fromAccount) - args.amount - fee

    //@ts-ignore
    if(currentTokenState.minting_account.Some){
        //@ts-ignore
        const newMintingAccountBalance = icrc1_balance_of(currentTokenState.minting_account.Some)
        //@ts-ignore
        AccountBalance.insert(currentTokenState.minting_account.Some,newMintingAccountBalance + fee)

    }

    AccountBalance.insert(fromAccount,newFrombalance)

    const updateBalance = icrc1_balance_of(fromAccount)

    const currentAllowance = icrc2_allowance({
        account:fromAccount,
        spender:caller
    })

    const newAllowance:Allowance = {allowance:currentAllowance.allowance - args.amount,expires_at:currentAllowance.expires_at}



    const Key:AllowanceKey = {
        from: fromAccount,
        to: caller
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
