import { ic, nat, Result } from 'azle';


import {
    Account,
    TransferArgs,
    TransferError
} from '../types';

export function icrc1_transfer(args: TransferArgs): Result<nat,TransferError> {
    const from: Account = {
        owner: ic.caller(),
        subaccount: args.from_subaccount
    };

    const validate_transfer_result = validate_transfer(args, from);

    if ('err' in validate_transfer_result) {
        return {
            Err: validate_transfer_result.err
        };
    }

    const from_is_minting_account = is_minting_account(from.owner);
    const to_is_minting_account = is_minting_account(args.to.owner);

    if (from_is_minting_account === true) {
        return handle_mint(args, from);
    }

    if (to_is_minting_account === true) {
        return handle_burn(args, from);
    }

    return handle_transfer(args, from);
}
