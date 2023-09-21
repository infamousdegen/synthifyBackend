import { Subaccount,Account,OwnerKey,SubaccountKey, TransferError,ApproveError, State } from "./types";
import { Opt,blob,nat32,nat64,ic,nat,match,Result,Principal } from "azle";
import { TokenState,AccountBalance } from "./storage/storage";
import { icrc1_balance_of } from "./query/queryFunctions";




// Validating whether the subAccount is of 32 bytes
export function is_subaccount_valid(subaccount: Opt<Subaccount>): boolean {
    return subaccount.Some === null || subaccount.Some?.length === 32 || subaccount.Some == undefined;
}

export function is_memo_valid(subaccount: Opt<Subaccount>): boolean {

    if(subaccount.Some!==undefined){
        if( subaccount.Some.length >= 32){
            return false
        }}
        return true
}

export function padPrincipalWithZeros(blob: blob): blob {
    let newUin8Array = new Uint8Array(32);
    newUin8Array.set(blob);
    return newUin8Array;
}

 

export function padSubAccount(account:Account):Account {
    let paddedAccount:Account
    if(account.subaccount.Some!== undefined ){
        const subAccountArray = padPrincipalWithZeros(account.subaccount.Some)
        paddedAccount = {...account,subaccount:Opt.Some(subAccountArray)}
    }
    else{
        paddedAccount = {...account,subaccount:Opt.None}

    }
    return (paddedAccount)


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


export function isValidFee(userFee:Opt<nat>): boolean{
    return match(TokenState.get(1n),{
        Some:(arg)=>{
            if(userFee.Some!==undefined){
             if( userFee.Some < arg.fee){ 
                return false
             }}

             return true

        },
        None:() => {
            return false
        }
    })
}
export function testingisValidFee(userFee:Opt<nat>): boolean{
    return match(TokenState.get(1n),{
        Some:(arg)=>{
            if(userFee.Some!==undefined){
            if( userFee.Some<arg.fee) {
                return false;
            }}
            return true

        },
        None:() => {
            return ic.trap("Error")
        }
    })
}


export function isExpired(expires_at:nat): boolean {
    const now = ic.time()

    if(expires_at < now){
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
export function is_minting_account(owner: Principal): boolean {

    return match(TokenState.get(1n),{
        Some:(arg)=>{

            if(arg.minting_account.Some!==undefined){
            if(owner.toString() === arg.minting_account.Some.owner.toString()){
                return true
            }}

             return false

        },
        None:() => {
            return(false)
        }
    })
}

export function is_anonymous(principal: Principal): boolean {
    return principal.toText() === '2vxsx-fae';
}

export function isValidBalance(userAccount:Account,fee:nat,amountToTransfer:nat):boolean{

    const currentBalance:nat = icrc1_balance_of(userAccount)

    if((currentBalance) < (amountToTransfer+fee)){
        return false
    }

    return true



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
