import { Subaccount,Account,OwnerKey,SubaccountKey } from "./types";
import { Opt,blob,nat32,nat64,ic } from "azle";

// Validating whether the subAccount is of 32 bytes
export function is_subaccount_valid(subaccount: Opt<Subaccount>): boolean {
    return subaccount === null || subaccount.Some?.length === 32;
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

export function is_created_at_time_in_future(created_at_time: Opt<nat64>,permitted_drift_nanos:nat64): boolean {
    const now = ic.time();
    let tx_time = now;

    if(created_at_time.Some){
     tx_time = created_at_time.Some;
    }

    
    if (tx_time > now && tx_time - now > permitted_drift_nanos) {
        return true;
    } else {
        return false;
    }
}

function is_created_at_time_too_old(created_at_time: Opt<nat64>,transaction_window_nanos:nat64,permitted_drift_nanos:nat64): boolean {
    const now = ic.time();
    let tx_time = now;

    if(created_at_time.Some){
     tx_time = created_at_time.Some;
    }

    if (
        tx_time < now &&
        now - tx_time > transaction_window_nanos + permitted_drift_nanos
    ) {
        return true;
    } else {
        return false;
    }
}

