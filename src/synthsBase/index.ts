

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

export {constructor,testingTokenState,getCurrentState} from "./init"

export {icrc2_approve} from "./Update/approveMain"
export {icrc1_transfer} from "./Update/transferMain"