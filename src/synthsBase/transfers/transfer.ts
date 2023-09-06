import { ic,match,Opt,nat } from 'azle';


//@todo: Check whether the user has enough amount to trasnfer 
//@todo: Make sure the sender has enough balance (i.e  amount + fees)
import {
    Account,
    Transaction,
    TransactionKind,
    TransferArgs,
    TransferResult,
    State
} from '../types';

import { TokenState,AccountBalance } from '../storage/storage';
import { icrc1_balance_of } from '../query/queryFunctions';

export function handle_transfer(args: TransferArgs, from: Account): TransferResult {





    let currentTokenState:State;

    let fee:nat = 0n;

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
        from: Opt.Some(from),
        kind: {
            Transfer:null
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




    const newFrombalance = icrc1_balance_of(from) - args.amount - fee

    const newTobalance = icrc1_balance_of(args.to)  + args.amount

    //@ts-ignore
    if(currentTokenState.minting_account.Some){
        //@ts-ignore
        const newMintingAccountBalance = icrc1_balance_of(currentTokenState.minting_account.Some)
        //@ts-ignore
        AccountBalance.insert(currentTokenState.minting_account.Some,newMintingAccountBalance + fee)

    }

    AccountBalance.insert(from,newFrombalance)
    AccountBalance.insert(args.to,newTobalance)





    const transfer_result: TransferResult = {
        Ok: args.amount
    };

    return transfer_result;
}
