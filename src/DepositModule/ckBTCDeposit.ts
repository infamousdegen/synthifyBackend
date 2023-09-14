
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

const ckBTC = new ICRC(
    Principal.fromText("mxzaz-hqaaa-aaaar-qaada-cai")
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
    to: string,
    amount: nat
): Promise<Variant<{ Ok: nat; Err: ICRCTransferError }>> {
    const result = await ckBTC
        .icrc1_transfer({
            from_subaccount: Opt.Some(
                padPrincipalWithZeros(ic.caller().toUint8Array())
            ),
            to: {
                owner: ic.id(),
                subaccount: Opt.Some(
                    padPrincipalWithZeros(Principal.fromText(to).toUint8Array())
                )
            },
            amount,
            fee: Opt.None,
            memo: Opt.None,
            created_at_time: Opt.None
        })
        .call();

    return match(result, {
        Ok: (ok) => ok,
        Err: (err) => ic.trap(err)
    });
}

$update;
export async function transferToVault(from:Principal,vaultId:nat,_VaultManagerAddress:Principal,amount:nat):Promise<Result<nat,ICRCTransferError>> 
{
    if(ic.caller() != VaultManagerAddress){
        ic.trap("Only Vault Can call this function")
    }
    const subaccount:blob = bigNumberToUint8Array(vaultId)
    const result = await ckBTC
        .icrc1_transfer({
            from_subaccount: Opt.Some(
                padPrincipalWithZeros(from.toUint8Array())
            ),
            to: {
                owner: _VaultManagerAddress,
                subaccount: Opt.Some(
                    padPrincipalWithZeros(subaccount)
                )
            },
            amount,
            fee: Opt.None,
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