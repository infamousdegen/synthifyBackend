import { ic, Opt, match } from 'azle';

import {
    Account,
    State,
    Transaction,
    TransferArgs,
    TransferResult
} from '../types';
import { icrc1_balance_of } from '../query/queryFunctions';
import { AccountBalance, TokenState } from '../storage/storage';

export function handle_mint(args: TransferArgs, from: Opt<Account>): TransferResult {


    let currentTokenState:State;

    match(TokenState.get(1n),{
        Some:(arg) => {
            currentTokenState = arg
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
        fee: 0n,
        from: from,
        kind: {
            Mint:null
        },
        timestamp: ic.time()

    }



    const newSate:State = {
        //@ts-ignore
        ...currentTokenState,
        //@ts-ignore
        total_supply:currentTokenState.total_supply + args.amount,

        //@ts-ignore
        transactions: [...currentTokenState.transactions,newTransaction]
    }

    TokenState.insert(1n,newSate)


    const newBalance = icrc1_balance_of(args.to) + args.amount

    AccountBalance.insert(args.to,newBalance)

    const transfer_result: TransferResult = {
        Ok: args.amount
    };

    return transfer_result;
}


