import {
    Alias,
    ic,
    $init,
    match,
    nat32,
    $query,
    StableBTreeMap,
    $update,
    Opt,
    Record,
    nat8,
    nat,
    Principal,
    blob,
    Variant,
    int,
    nat64,
    Vec,
    Tuple
} from 'azle';

import {  InitArgs,State,AllowanceKey,Account,AllowanceStorageData,Allowance } from './types';
import { AllowanceStorage, TokenState,AccountBalance } from './storage/storage';
import { padSubAccount } from './helper';






$update;
export  function constructor(Init:InitArgs):string {
    const State:State = {
        decimals : Init.decimal,
        fee: Init.fee,
        metadata : [

                ['icrc1:decimals', { Nat: Init.decimal }],
                ['icrc1:fee', { Nat: Init.fee }],
                ['icrc1:name', { Text: Init.name }],
                ['icrc1:symbol', { Text: Init.symbol }],
                ['custom:currencyKey',{Blob: Init.currencyKey}],
                ...Init.metadata

        ],
        minting_account: Init.minting_account,

        primary_account: Init.primary_account,

        name: Init.name,
        permitted_drift_nanos: Init.permitted_drift_nanos,
        supported_standards: [
            {
                name: 'ICRC-1',
                url: 'https://github.com/dfinity/ICRC-1'
            },
            {
                name: 'ICRC-2',
                url: 'https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2'
            },
            ...Init.supported_standards
        ],
        symbol: Init.symbol,

        
        transaction_window_nanos: Init.transaction_window_nanos,
        //not specified in spec but it is for my project
        currencyKey: Init.currencyKey,
        total_supply: 0n,
        transactions: [],
    }
    TokenState.insert(1n,State)

    return ("Done")
}


$update;
export function testingTokenState():string{
    const state:State = {
        decimals:8n,
        fee: 10n,
        metadata : [

            ['icrc1:decimals', { Nat: 8n }],
            ['icrc1:fee', { Nat: 0n }],
            ['icrc1:name', { Text:"Token"}],                                                     
            ['icrc1:symbol', { Text: "symbol" }],
            ['custom:currencyKey',{Blob: new Uint8Array()}],

       ],

        supported_standards: [
            {
                name: 'ICRC-1',
                url: 'https://github.com/dfinity/ICRC-1'
            },
            {
                name: 'ICRC-2',
                url: 'https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2'
            },
        ],
        minting_account:Opt.Some({
            owner:Principal.fromText("avqkn-guaaa-aaaaa-qaaea-cai"),
            subaccount:Opt.None
        }),
        primary_account: Opt.Some({
            owner:Principal.fromText("2vxsx-fae"),
            subaccount:Opt.None
        }),
        name: "synthetis Usd",
        permitted_drift_nanos: 86_400_000_000_000n,
        symbol: "synUsd",
        total_supply:0n,
        transaction_window_nanos:86_400_000_000_000n,
        currencyKey: new Uint8Array(),
        transactions : []

    }

    TokenState.insert(1n,state)
    return("Done")
}

$update;
export function testingBalance(_account:Account,amount:nat):string{
    let account:Account = _account

    account = padSubAccount(account)
    AccountBalance.insert(account,amount)
    return("done")
}
$update;
export function testingAllowance():string {

    let from:Account = {
        owner:Principal.fromText("giy3c-khloq-v2zio-tjs3r-evrzf-7fzm4-c3zlh-227wl-vburm-4zbcp-lqe"),
        subaccount:Opt.None
    }
    
    let to:Account = {
        owner:Principal.fromText("giy3c-khloq-v2zio-tjs3r-evrzf-7fzm4-c3zlh-227wl-vburm-4zbcp-lqe"),
        subaccount:Opt.None
    }

    from = padSubAccount(from)
    to = padSubAccount(to)

    const allowanceKey:AllowanceKey = {
        from:from,
        to:to
    }
    
    const allowance:Allowance = {
        allowance:10_000n,
        expires_at:Opt.None
    }

    const allowanceStorage:AllowanceStorageData = {
        Allowance:allowance,
        fee:0n,
        created_at_time:ic.time(),
        memo:Opt.None
    }
    AllowanceStorage.insert(allowanceKey,allowanceStorage)
    return("done")

}

$query;
export function getCurrentState():State {
    return(match(TokenState.get(1n),{
        Some:(args) => args,
        None:() => ic.trap("Some error occured")
    }))
}
$query;
export function items(): Vec<Tuple<[AllowanceKey, AllowanceStorageData]>> {
    return AllowanceStorage.items();
}

$query;
export function keys(): Vec<AllowanceKey> {
    return AllowanceStorage.keys();
}

$query;
export function values(): Vec<AllowanceStorageData> {
    return AllowanceStorage.values();
}