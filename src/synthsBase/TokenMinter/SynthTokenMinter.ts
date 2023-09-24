import { serviceQuery,serviceUpdate } from "azle";
import { $update,nat,Principal,blob,Result,CallResult,Opt,match,ic } from "azle";

import {TransferError,AllowanceArgs,Allowance,Account} from "../types"

import { ICRC,ICRCTransferArgs} from "azle/canisters/icrc";
import { padPrincipalWithZeros, padSubAccount } from "../helper";

class SynthToken extends ICRC {
    @serviceQuery
    icrc2_allowance:(allowance_args:AllowanceArgs) => CallResult<Allowance>

    @serviceQuery
    icrc1_balance_of:(Account:Account) => CallResult<nat>
}


const SynthTokenCanister = new SynthToken(
    Principal.fromText("i3r53-5aaaa-aaaal-qcdqa-cai")
)

let VaultManager:Principal


$update;
export async function mintToken(amount:nat,account:Account,memo:Opt<blob>):Promise<Result<nat,TransferError>> {
    if(ic.caller().toString() !== VaultManager.toString()){
        ic.trap("only vault manager can call this function ")
    }
    const toAccount:Account = padSubAccount(account)

    

    const transferArgs:ICRCTransferArgs = {
        from_subaccount : Opt.None,
        to:toAccount,
        amount:amount,
        fee:Opt.None,
        memo:memo,
        created_at_time:Opt.None
    }

    const callResult = match(await SynthTokenCanister.icrc1_transfer(transferArgs).call(),{
        Ok(arg) {
            return arg
        },
        Err(arg) {
            ic.trap(arg)
        },
    })

    return(match(callResult,{
        Ok(arg) {
            return Result.Ok<nat,TransferError>(arg)
        },
        Err(arg) {
            return  Result.Err<nat,TransferError>(arg)
        },
    }))


}

//@note: major issue only authorised persion should call this 
$update;
export function updateVaultManager(address:Principal):string{
    VaultManager = address
    return("done")
}