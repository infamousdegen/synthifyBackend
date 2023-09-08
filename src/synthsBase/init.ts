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
    nat64
} from 'azle';

import {  InitArgs,State } from './types';
import { TokenState } from './storage/storage';






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
export function testinConstructor():string{
    const state:State = {
        decimals:8n,
        fee: 0n,
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
        minting_account: Opt.None,
        primary_account: Opt.None,
        name: "Token",
        permitted_drift_nanos: 0n,
        symbol: "symbol",
        total_supply:0n,
        transaction_window_nanos:0n,
        currencyKey: new Uint8Array(),
        transactions : []

    }

    TokenState.insert(1n,state)
    return("Done")
}
