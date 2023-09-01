
import { blob, ic, nat, nat64, Opt, Principal,match } from 'azle';
import {
    Account,
    Subaccount,
    TransferArgs,
    ValidateTransferResult,
    ApproveError,
    TransferError,
    ValidateApproveResult
} from './types';

import { icrc1_balance_of } from './queryFunctions/queryFunctions';
import { TokenState } from './storage/storage';

import { is_subaccount_valid,
    is_created_at_time_in_future,is_created_at_time_too_old, 
    isValidFee,is_memo_valid,
    is_minting_account,is_anonymous } from './helper';


export function validate_transfer(
    args: TransferArgs,
    from: Account
): ValidateTransferResult {



    let currentStateFee = 0n

    let permitted_drift_nanos = 0n

    let  transaction_window_nanos = 0n

    const currentLedgerTime = ic.time()
    const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime


    match(TokenState.get(1n),{
        Some:(arg)=>{
             currentStateFee = arg.fee
             permitted_drift_nanos = arg.permitted_drift_nanos
             transaction_window_nanos = arg.transaction_window_nanos
        },
        None:() => {
            return({
                err:
                {
                    TemporarilyUnavailable:null
                
                }
            })
        }
    })


    const from_subaccount_is_valid = is_subaccount_valid(args.from_subaccount);

    if (from_subaccount_is_valid === false) {
        return {
            err: {
                GenericError: {
                    error_code: 0n,
                    message: 'from_subaccount must be 32 bytes in length'
                }
            }
        };
    }

    const to_subaccount_is_valid = is_subaccount_valid(args.to.subaccount);

    if (to_subaccount_is_valid === false) {
        return {
            err: {
                GenericError: {
                    error_code: 0n,
                    message: 'to.subaccount must be 32 bytes in length'
                }
            }
        };
    }
    //@todo: Check for is memo valid 

    const memo_is_valid = is_memo_valid(args.memo);

    if (memo_is_valid === false) {
        return {
            err: {
                GenericError: {
                    error_code: 0n,
                    message: 'memo must be a maximum of 32 bytes in length'
                }
            }
        };
    }

    const created_at_time_is_in_future = is_created_at_time_in_future(currentLedgerTime,
        finalCreateTime,permitted_drift_nanos
    );

    if (created_at_time_is_in_future === true) {
        return {
            err: {
                CreatedInFuture: {
                    ledger_time: currentLedgerTime
                }
            }
        };
    }

    const created_at_time_too_old = is_created_at_time_too_old(currentLedgerTime,
        finalCreateTime,transaction_window_nanos,permitted_drift_nanos
    );

    if (created_at_time_too_old === true) {
        return {
            err: {
                TooOld: null
            }
        };
    }

    //@todo: Do find duplication error

    // const duplicate_transaction_index = find_duplicate_transaction_index(args, from);

    // if (duplicate_transaction_index !== null) {
    //     return {
    //         err: {
    //             Duplicate: {
    //                 duplicate_of: duplicate_transaction_index
    //             }
    //         }
    //     };
    // }

    

    //@todo: Not sure if this comparison is useful 
    const from_is_minting_account = is_minting_account(from.owner);

    if (from_is_minting_account === true && (args.fee.Some ?? 0n) !== 0n) {
        return {
            err: {
                BadFee: {
                    expected_fee: 0n
                }
            }
        };
    }

    const to_is_minting_account = is_minting_account(args.to.owner);

    if (to_is_minting_account === true) {
        if ((args.fee.Some ?? 0n) !== 0n) {
            return {
                err: {
                    BadFee: {
                        expected_fee: 0n
                    }
                }
            };
        }

        if (args.amount < currentStateFee) {
            return {
                err: {
                    BadBurn: {
                        min_burn_amount: currentStateFee
                    }
                }
            };
        }
    }

    
    if (!from_is_minting_account && !to_is_minting_account) {
        const validateFee = isValidFee(args.fee)

        if(validateFee !== true){
            return {
                err: validateFee as TransferError
                
            }
        }
    }

    const from_balance = icrc1_balance_of(from);

    if (
        from_is_minting_account === false &&
        from_balance < args.amount + currentStateFee
    ) {
        return {
            err: {
                InsufficientFunds: {
                    balance: from_balance
                }
            }
        };
    }


    const from_is_anonymous = is_anonymous(from.owner);

    if (from_is_anonymous === true) {
        return {
            err: {
                GenericError: {
                    error_code: 0n,
                    message: 'anonymous user is not allowed to transfer funds'
                }
            }
        };
    }

    return {
        ok: true
    };
}


export function validate_approve(    
    args: TransferArgs,
    from: Account): ValidateApproveResult{

        let currentStateFee = 0n

        let permitted_drift_nanos = 0n
    
        let  transaction_window_nanos = 0n
    
        const currentLedgerTime = ic.time()
        const finalCreateTime = args.created_at_time.Some ? args.created_at_time.Some : currentLedgerTime
    
    
        match(TokenState.get(1n),{
            Some:(arg)=>{
                 currentStateFee = arg.fee
                 permitted_drift_nanos = arg.permitted_drift_nanos
                 transaction_window_nanos = arg.transaction_window_nanos
            },
            None:() => {
                return({
                    err:
                    {
                        TemporarilyUnavailable:null
                    
                    }
                })
            }
        })


        return{
            ok:true
        }

    }









