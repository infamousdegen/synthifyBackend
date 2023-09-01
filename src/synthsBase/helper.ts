import { Subaccount,Account,OwnerKey,SubaccountKey, TransferError,ApproveError } from "./types";
import { Opt,blob,nat32,nat64,ic,nat,match,Result,Principal } from "azle";
import { TokenState } from "./storage/storage";




// Validating whether the subAccount is of 32 bytes
export function is_subaccount_valid(subaccount: Opt<Subaccount>): boolean {
    return subaccount === null || subaccount.Some?.length === 32;
}

export function is_memo_valid(subaccount: Opt<Subaccount>): boolean {

        if(subaccount.Some && subaccount.Some.length >= 32){
            return false
        }
        return true
}

export function padPrincipalWithZeros(blob: blob): blob {
    let newUin8Array = new Uint8Array(32);
    newUin8Array.set(blob);
    return newUin8Array;
}

export function get_account_keys(account: Account): {
    owner_key: OwnerKey;
    subaccount_key: SubaccountKey;
} {
    const owner_key: OwnerKey = account.owner.toText();
    let subaccount_key:SubaccountKey

    if(account.subaccount.Some){
        const subAccountArray = padPrincipalWithZeros(account.subaccount.Some)
        subaccount_key  = subAccountArray.toString()
    }
    else{
        const subAccountArray = new Uint8Array(32).fill(0);
         subaccount_key  = subAccountArray.toString();
    }
    return {
        owner_key,
        subaccount_key
    };
}

export function is_created_at_time_in_future(currentTime:nat,created_at_time: nat64,permitted_drift_nanos:nat64): boolean {
    const now = currentTime;

    const tx_time = created_at_time


    
    if (tx_time > now && tx_time - now > permitted_drift_nanos) {
        return true;
    } else {
        return false;
    }
}

export function is_created_at_time_too_old(currentTime:nat,created_at_time: nat64,transaction_window_nanos:nat64,permitted_drift_nanos:nat64): boolean {
    const now = currentTime;

    const tx_time = created_at_time




    if (
        tx_time < now &&
        now - tx_time > transaction_window_nanos + permitted_drift_nanos
    ) {
        return true;
    } else {
        return false;
    }
}


export function isValidFee(userFee:Opt<nat>): boolean | ApproveError | TransferError {
    return match(TokenState.get(1n),{
        Some:(arg)=>{

             if(userFee.Some && userFee.Some < arg.fee){
                return ({BadFee: {expected_fee:arg.fee}})
             }

             return true

        },
        None:() => {
            return({TemporarilyUnavailable:null})
        }
    })
}

export function isExpired(expires_at:Opt<nat>): boolean {
    const now = ic.time()

    if(expires_at.Some && expires_at.Some < now){
        return true
    }

    return false
}

export function isExpectedAllowance(expected_allowance:Opt<nat>,currentAllowance:nat):boolean{
    return match(expected_allowance,{
        Some:(value) => {
            if (value !==currentAllowance){
                return false
            }

            return true
        },
        None:() => {
            return true
        }
    })


}


//@todo: fix this 
export function is_minting_account(owner: Principal): boolean | TransferError | ApproveError {

    return match(TokenState.get(1n),{
        Some:(arg)=>{

            if(arg.minting_account.Some && owner.toString() === arg.minting_account.Some.owner.toString()){
                return true
            }

             return false

        },
        None:() => {
            return({TemporarilyUnavailable:null})
        }
    })
}

export function is_anonymous(principal: Principal): boolean {
    return principal.toText() === '2vxsx-fae';
}



// function find_duplicate_transaction_index(
//     transfer_args: TransferArgs,
//     from: Account
// ): Opt<nat> {
//     const now = ic.time();

//     for (let i = 0; i < state.transactions.length; i++) {
//         const transaction = state.transactions[i];

//         if (
//             stringify({
//                 ...transfer_args,
//                 from
//             }) === stringify({
//                 ...transaction.args,
//                 from: transaction.from
//             }) &&
//             transaction.timestamp < now + state.permitted_drift_nanos &&
//             now - transaction.timestamp <
//                 state.transaction_window_nanos + state.permitted_drift_nanos
//         ) {
//             return BigInt(i);
//         }
//     }

//     return null;
// }


// export function stringify(value: any): string {
//     return JSON.stringify(value, (_, value) =>
//         typeof value === 'bigint' ? value.toString() : value
//     );
// }
