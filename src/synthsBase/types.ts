import { blob, int, nat, nat8, nat64, Opt, Principal, Variant,Record,Vec, Tuple,Alias } from 'azle';

export type Subaccount = Alias<blob>;

export type SubaccountKey = Alias<string>;
export type OwnerKey = Alias<string>;

export type Account = Record<{
    owner: Principal;
    subaccount: Opt<Subaccount>;
}>;

// export type AllowanceKey = Record<{
//     [FromPrimary: OwnerKey]: {
//       [FromSubAccount: SubaccountKey]: {
//         [ToPrimary: OwnerKey]:SubaccountKey
        
//       }  
//     };
//   }>;




export type AllowanceKey = Record<{
    from:Account,
    to:Account
}>
export type CurrencyKey  = Alias<blob>;





export  type InitArgs = Record<{
    decimal:nat,
    fee: nat;
    metadata: Vec<Metadatum>;
    minting_account: Opt<Account>;
    primary_account: Opt<Account>;
    name: string;
    permitted_drift_nanos: nat64;
    supported_standards: Vec<SupportedStandard>;
    symbol: string;
    total_supply:nat
    transaction_window_nanos: nat64;
    currencyKey: CurrencyKey
}>;

export type Value = Variant<{
    Blob: blob;
    Int: int;
    Nat: nat;
    Text: string;
}>;



export type Metadatum = Alias<Vec<Tuple<[string, Value]>>>;



export type State = Record<{

    decimals: nat;
    fee: nat;
    metadata: Metadatum;
    minting_account: Opt<Account>;
    primary_account: Opt<Account>;
    name: string;
    permitted_drift_nanos: nat64;
    supported_standards: Vec<SupportedStandard>;
    symbol: string;
    total_supply: nat;
    transactions: Vec<Transaction>;
    transaction_window_nanos: nat64;
    currencyKey:CurrencyKey
}>;



export type SupportedStandard = Record<{
    name: string;
    url: string;
}>;

export type Transaction = Record<{
    args: Variant<{
        TransferArgs:TransferArgs,  
        ApproveArgs:ApproveArgs,
        TransferFromArgs:TransferFromArgs
    }>;
    fee: nat;
    from: Opt<Account>;
    kind: TransactionKind;
    timestamp: nat64;
}>;

export type TransactionKind = Variant<{
    Burn: null;
    Mint: null;
    Transfer: null;
    Approve:null
    TransferFrom:null

}>;

export type ApproveArgs = Record<{
    from_subaccount: Opt<Subaccount>;
    spender: Account
    amount:nat
    expected_allowance: Opt<nat>
    expires_at: Opt<nat64>
    fee:Opt<nat>
    memo: Opt<blob>
    created_at_time:Opt<nat>
}>


export type ApproveError = Variant<{
    BadFee: Record<{expected_fee:nat}>
    InsufficientFunds: Record<{balance:nat}>
    AllowanceChanged: Record<{current_allowance : nat}>
    Expired: Record<{ledger_time : nat64}>
    TooOld: null
    CreatedInFuture: Record<{ledger_time : nat64}>
    Duplicate: Record<{duplicate_of : nat}>
    TemporarilyUnavailable: null
    GenericError: Record<{error_code:nat; message:string}>
}>

export type TransferFromError = Variant<{
    BadFee :  Record<{ expected_fee : nat }>;
    BadBurn :  Record<{ min_burn_amount : nat }>;
    // The [from] account does not hold enough funds for the transfer.
    InsufficientFunds :  Record<{ balance : nat }>;
    // The caller exceeded its allowance.
    InsufficientAllowance :  Record<{ allowance : nat }>;
    TooOld: null;
    CreatedInFuture:  Record<{ ledger_time : nat64 }>;
    Duplicate :  Record<{ duplicate_of : nat }>;
    TemporarilyUnavailable:null;
    GenericError :  Record<{ error_code : nat; message : string }>;
}>

export type TransferFromArgs =  Record<{
    spender_subaccount :  Opt<blob>;
    from : Account;
    to : Account;
    amount : nat;
    fee :  Opt<nat>;
    memo :  Opt<blob>;
    created_at_time : Opt <nat64>;
}>;

export type AllowanceArgs =  Record<{
    account : Account;
    spender : Account;
}>;

export type Allowance =  Record<{
    allowance : nat;
    expires_at : Opt< nat64>;
    
  }>

  //@todo: Fee not needed in allowance storage data 
export type AllowanceStorageData = Record<{
    Allowance: Allowance
    fee: nat
    created_at_time: nat
    memo:Opt<blob>
}>

export type TransferArgs = Record<{
    amount: nat;
    created_at_time: Opt<nat64>;
    fee: Opt<nat>;
    from_subaccount: Opt<Subaccount>;
    memo: Opt<blob>;
    to: Account;
}>;

export type TransferError = Variant<{
    BadBurn: Record<{ min_burn_amount: nat }>;
    BadFee: Record<{ expected_fee: nat }>;
    CreatedInFuture: Record<{ ledger_time: nat64 }>;
    Duplicate: Record<{ duplicate_of: nat }>;
    GenericError: Record<{ error_code: nat; message: string }>;
    InsufficientFunds: Record<{ balance: nat }>;
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

