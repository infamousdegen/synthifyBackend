import { ic, nat, Result,match,Opt } from 'azle';


import {
    Account,
    TransferArgs,
    TransferError,
    State
} from '../types';
import { validate_transfer } from '../validations';
import { TokenState } from '../storage/storage';

import { is_minting_account } from '../helper';

import { handle_mint } from '../transfers/mint';
import { handle_burn } from '../transfers/burn';

export function icrc1_transfer(args: TransferArgs): Result<nat,TransferError> {
    const from: Account = {
        owner: ic.caller(),
        subaccount: args.from_subaccount
    };


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
    const validate_transfer_result = validate_transfer(args, from,currentTokenState,currentLedgerTime);

    if ( validate_transfer_result.err) {
        return {
            Err: validate_transfer_result.err
        };
    }

    const from_is_minting_account = is_minting_account(from.owner);
    const to_is_minting_account = is_minting_account(args.to.owner);

    if (from_is_minting_account === true) {
        return handle_mint(args, Opt.Some(from));
    }

    if (to_is_minting_account === true) {
        return handle_burn(args, from);
    }

    return handle_transfer(args, from);
}
