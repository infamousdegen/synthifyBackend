import { ic, nat, Result,match,Opt, $update } from 'azle';


import {
    Account,
    TransferArgs,
    TransferError,
    State,
    TransferFromArgs,
    TransferFromError,
    Allowance
} from '../types';
import { validate_transfer, validate_transfer_from } from '../validations';
import { TokenState } from '../storage/storage';

import { is_minting_account } from '../helper';

import { handle_mint } from '../transfers/mint';
import { handle_burn } from '../transfers/burn';
import { handle_transfer } from '../transfers/transfer';
import { icrc2_allowance } from '../query/queryFunctions';

$update

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

//@todo: Check if the created at time and expires at is correct 
//@todo: Burn if to amount is the minting account 


$update;
export function icrc2_transfer_from(caller:Account,args:TransferFromArgs): Result<nat,TransferFromError>{
    // const Caller:Account = {
    //     owner: ic.caller(),
    //     subaccount:args.spender_subaccount

    // }

    const Caller:Account = caller




    

    


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
    const validate_transferFrom_result = validate_transfer_from(args,Caller,currentTokenState,currentLedgerTime)

    if(validate_transferFrom_result.err){
        return {
            Err:validate_transferFrom_result.err
        }
    }

    
    // if (to_is_minting_account === true) {
    //     return handle_burn(args, from);
    // }




    return(Result.Ok<nat,TransferFromError>(args.amount))




}
