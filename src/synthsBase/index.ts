

export {icrc1_symbol,
    icrc1_name,
    icrc1_decimals,
    icrc1_total_supply,
    icrc1_minting_account,
    icrc1_supported_standards,
    icrc1_metadata,
    icrc2_allowance,
    icrc1_fee,
    icrc1_balance_of,
    testPadAccount
} from './query/queryFunctions';

export {constructor,testingTokenState,getCurrentState,updateMinterAccount,updatePrimaryAccount} from "./init"

export {icrc2_approve} from "./Update/approveMain"
export {icrc1_transfer,icrc2_transfer_from} from "./Update/transferMain"

// "synbase":{
//     "main":"src/synthsBase/index.ts",
//     "type":"custom",
//     "build": "npx azle synbase",
//     "root":"src/synthsBase",
//     "ts":"src/synthsBase/index.ts",
//     "candid":"/home/metadev/SynthifyBackend/src/candidFiles/synbase.did",
//     "wasm":".azle/synbase/synbase.wasm.gz"
//   },