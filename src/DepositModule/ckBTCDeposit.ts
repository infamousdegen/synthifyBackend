
import {
    blob,
    ic,
    match,
    nat,
    nat64,
    Opt,
    Principal,
    $update,
    Variant,
    $query,
    Result
} from 'azle';
import {ICRC,ICRCTransferError} from 'azle/canisters/icrc'







import { UpdateBalanceResult,Minter } from './minter';
import { Account } from '../synthsBase/types';
import { padSubAccount } from '../synthsBase/helper';

const ckBTC = new ICRC(
    Principal.fromText("be2us-64aaa-aaaaa-qaabq-cai")
);

const minter = new Minter(
    Principal.fromText("mqygn-kiaaa-aaaar-qaadq-cai")
);

let VaultManagerAddress:Principal
$update;
export async function getBalance(of:Principal): Promise<nat> {
    const result = await ckBTC
        .icrc1_balance_of({
            owner: ic.id(),
            subaccount: Opt.Some(
                padPrincipalWithZeros(of.toUint8Array())
            )
        })
        .call();

    return match(result, {
        Ok: (ok) => ok,
        Err: (err) => ic.trap(err)
    });
}

$update;
export async function updateBalance(): Promise<UpdateBalanceResult> {
    const result = await minter
        .update_balance({
            owner: Opt.Some(ic.id()),
            subaccount: Opt.Some(
                padPrincipalWithZeros(ic.caller().toUint8Array())
            )
        })
        .call();

    return match(result, {
        Ok: (ok) => ok,
        Err: (err) => ic.trap(err)
    });
}

$update;
export async function getBtcDepositAddress(): Promise<string> {
    const result = await minter
        .get_btc_address({
            owner: Opt.Some(ic.id()),
            subaccount: Opt.Some(
                padPrincipalWithZeros(ic.caller().toUint8Array())
            )
        })
        .call();

    return match(result, {
        Ok: (ok) => ok,
        Err: (err) => ic.trap(err)
    });
}


// @todo: This method should not be exposed to everyone 
$update;
export async function transfer(
    to: Account,
    amount: nat
): Promise<Variant<{ Ok: nat; Err: ICRCTransferError }>> {
    const result = await ckBTC
        .icrc1_transfer({
            from_subaccount: Opt.Some(
                padPrincipalWithZeros(ic.caller().toUint8Array())
            ),
            to: padSubAccount(to),
            amount,
            fee: Opt.Some(10n),
            memo: Opt.None,
            created_at_time: Opt.None
        })
        .call();

    return match(result, {
        Ok: (ok) => ok,
        Err: (err) => ic.trap(err)
    });
}
// from:Principal,vaultId:nat,_VaultManagerAddress:Principal,_amount:nat
//Promise<Result<nat,ICRCTransferError>

$update;
export async function transferToVault(from:Principal,vaultId:nat,_VaultManagerAddress:Principal,_amount:nat  ):Promise<Result<nat,ICRCTransferError>>
{
    if(ic.caller().toString() != VaultManagerAddress.toString()){
        ic.trap("Only Vault Can call this function")
    }


    const subaccount:blob = bigNumberToUint8Array(vaultId)
    const toAccount:Account = {
        owner:_VaultManagerAddress,
        subaccount:Opt.Some(subaccount)
    }
    
    const result = await ckBTC
        .icrc1_transfer({
            from_subaccount: Opt.Some(
                padPrincipalWithZeros(from.toUint8Array())
            ),
            to: padSubAccount(toAccount),
            amount:_amount,
            fee: Opt.Some(10n),
            memo: Opt.None,
            created_at_time: Opt.None
        })
        .call();

        const calResult =  match(result, {
            Ok: (ok) =>  (ok),
            Err: (err) => ic.trap(`Call Result Error ${err}`)
        });


        return(match(calResult,{
            Ok(arg) {
                return Result.Ok<nat,ICRCTransferError>(arg)
            },
            Err(arg) {
                return Result.Err<nat,ICRCTransferError>(arg)
            },
        }))

    
}


$update;
export async function  mintTokens(account:Account,amount:nat):Promise<Variant<{ Ok: nat; Err: ICRCTransferError }>> {
    const result = await ckBTC
    .icrc1_transfer({
        from_subaccount: Opt.None,
        to: account,
        amount:amount,
        fee: Opt.Some(10n),
        memo: Opt.None,
        created_at_time: Opt.None
    })
    .call();

return match(result, {
    Ok: (ok) => ok,
    Err: (err) => ic.trap(err)
});
}

function padPrincipalWithZeros(blob: blob): blob {
    let newUin8Array = new Uint8Array(32);
    newUin8Array.set(blob);
    return newUin8Array;
}



function bigNumberToUint8Array(bigNumber:nat):blob {
    const str = bigNumber.toString();
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array;
  }


$update; 
export function getTime():nat{
    return(ic.time())
}

$query;
export function getCaller():Principal{
    return(ic.caller())
}

$query;
export function getUint8array(account:Principal):blob {
    return(padPrincipalWithZeros(account.toUint8Array()))
}

$update;
export function updateVaultManagerAddress(address:Principal):string{
    VaultManagerAddress = address
    return("ok")
}