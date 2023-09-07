import { NullClass } from '@dfinity/candid/lib/cjs/idl';
import { blob, int, nat, nat8, nat64, Opt, Principal, Variant } from 'azle';

export type Subaccount = blob;

export type SubaccountKey = string;
export type OwnerKey = string;

export type Account = {
    owner: Principal;
    subaccount: Opt<Subaccount>;
};

export type AllowanceKey = {
    [FromPrimary: OwnerKey]: {
      [FromSubAccount: SubaccountKey]: {
        [ToPrimary: OwnerKey]:SubaccountKey
        
      }  
    };
  };

export type CurrencyKey  = blob;


export  type InitArgs = {
    decimal:nat,
    fee: nat;
    metadata: Metadatum[];
    minting_account: Opt<Account>;
    primary_account: Opt<Account>;
    name: string;
    permitted_drift_nanos: nat64;
    supported_standards: SupportedStandard[];
    symbol: string;
    total_supply:nat
    transaction_window_nanos: nat64;
    currencyKey: CurrencyKey
};

export type Value = Variant<{
    Blob: blob;
    Int: int;
    Nat: nat;
    Text: string;
}>;



export type Metadatum = [string, Value];



export type State = {

    decimals: nat;
    fee: nat;
    metadata: Metadatum[];
    minting_account: Opt<Account>;
    primary_account: Opt<Account>;
    name: string;
    permitted_drift_nanos: nat64;
    supported_standards: SupportedStandard[];
    symbol: string;
    total_supply: nat;
    transactions: Transaction[];
    transaction_window_nanos: nat64;
    currencyKey:CurrencyKey
};



export type SupportedStandard = {
    name: string;
    url: string;
};

export type Transaction = {
    args: Opt<TransferArgs> | Opt<ApproveArgs> | Opt<TransferFromArgs>;
    fee: nat;
    from: Opt<Account>;
    kind: TransactionKind;
    timestamp: nat64;
};

export type TransactionKind = Variant<{
    Burn: null;
    Mint: null;
    Transfer: null;
    Approve:null
    TransferFrom:null

}>;

export type ApproveArgs = {
    from_subaccount: Opt<Subaccount>;
    spender: Account
    amount:nat
    expected_allowance: Opt<nat>
    expires_at: Opt<nat64>
    fee:Opt<nat>
    memo: Opt<blob>
    created_at_time:Opt<nat>
}

export type ApproveError = Variant<{
    BadFee: {expected_fee:nat}
    InsufficientFunds: {balance:nat}
    AllowanceChanged: {current_allowance : nat}
    Expired: {ledger_time : nat64}
    TooOld: null
    CreatedInFuture: {ledger_time : nat64}
    Duplicate: {duplicate_of : nat}
    TemporarilyUnavailable: null
    GenericError: {error_code:nat; message:string}
}>

export type TransferFromError = Variant<{
    BadFee :  { expected_fee : nat };
    BadBurn :  { min_burn_amount : nat };
    // The [from] account does not hold enough funds for the transfer.
    InsufficientFunds :  { balance : nat };
    // The caller exceeded its allowance.
    InsufficientAllowance :  { allowance : nat };
    TooOld: null;
    CreatedInFuture:  { ledger_time : nat64 };
    Duplicate :  { duplicate_of : nat };
    TemporarilyUnavailable:null;
    GenericError :  { error_code : nat; message : string };
}>

export type TransferFromArgs =  {
    spender_subaccount :  Opt<blob>;
    from : Account;
    to : Account;
    amount : nat;
    fee :  Opt<nat>;
    memo :  Opt<blob>;
    created_at_time : Opt <nat64>;
};

export type AllowanceArgs =  {
    account : Account;
    spender : Account;
};

export type Allowance =  {
    allowance : nat;
    expires_at : Opt< nat64>;
    
  }

  //@todo: Fee not needed in allowance storage data 
export type AllowanceStorageData = {
    Allowance: Allowance
    fee: nat
    created_at_time: nat
    memo:Opt<blob>
}

export type TransferArgs = {
    amount: nat;
    created_at_time: Opt<nat64>;
    fee: Opt<nat>;
    from_subaccount: Opt<Subaccount>;
    memo: Opt<blob>;
    to: Account;
};

export type TransferError = Variant<{
    BadBurn: { min_burn_amount: nat };
    BadFee: { expected_fee: nat };
    CreatedInFuture: { ledger_time: nat64 };
    Duplicate: { duplicate_of: nat };
    GenericError: { error_code: nat; message: string };
    InsufficientFunds: { balance: nat };
    TemporarilyUnavailable: null;
    TooOld: null;
}>;

export type TransferResult = Variant<{
    Ok: nat;
    Err: TransferError;
}>;

export type TransferFromResult = Variant<{
    Ok:nat;
    Err:TransferFromError
}>

export type ValidateTransferResult = Variant<{
    ok: boolean;
    err: TransferError;
}>;

export type ValidateApproveResult = Variant<{
    ok:boolean;
    err:ApproveError;
}>

export type ValidateTransferFromResult = Variant<{
    ok:boolean;
    err:TransferFromError
}>

