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

import { is_minting_account, padSubAccount } from '../helper';

import { handle_mint } from '../transfers/mint';
import { handle_burn } from '../transfers/burn';
import { handle_transfer } from '../transfers/transfer';
import { icrc2_allowance } from '../query/queryFunctions';

import { handle_transfer_from_burn } from '../transfers/transferFromBurn';
import { handle_transfer_from } from '../transfers/transferFrom';

$update
export function icrc1_transfer(args: TransferArgs): Result<nat,TransferError> {
    const from: Account = padSubAccount({
        owner: ic.caller(),
        subaccount: args.from_subaccount
    });


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
    const currentTransactionCounter = currentTokenState.transactions.length

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
export function icrc2_transfer_from(args:TransferFromArgs): Result<nat,TransferFromError>{
    const Caller:Account = padSubAccount({
        owner: ic.caller(),
        subaccount:args.spender_subaccount

    })






    

    


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

    if(validate_transferFrom_result.err!==undefined){
        return {
            Err:validate_transferFrom_result.err
        }
    }

    if(is_minting_account(args.to.owner)){
        const result = handle_transfer_from_burn(args,Caller)

        if(result.Err !==undefined){
            return(Result.Err<nat,TransferFromError>(result.Err))
        }
    }

    else{
    const result = handle_transfer_from(args,Caller)
    if(result.Err !== undefined){
        return(Result.Err<nat,TransferFromError>(result.Err))
    }
    }



    //@ts-ignore
    return(Result.Ok<nat,TransferFromError>(BigInt(currentTokenState.transactions.length)))




}
