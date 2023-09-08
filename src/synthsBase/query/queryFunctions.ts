import { AccountBalance,TokenState,AllowanceStorage } from "../storage/storage";
import { $query,match,nat,Result,Opt,$update,blob,int,Vec, Tuple } from "azle";
import { Account,Metadatum,SupportedStandard,AllowanceArgs,AllowanceKey, Allowance, State } from "../types";

import { padSubAccount } from "../helper";

$update;
export function updateTokenState():string{
    const state:State = {
        decimals: 8n,
        // fee: 0n,
        // minting_account: Opt.None,
        // primary_account: Opt.None,
        // name: "Token",
        // permitted_drift_nanos: 0n,
        // symbol: "symbl",
        // total_supply:0n,
        // transaction_window_nanos:0n

    }

    TokenState.insert(1n,state)
    return("Done")
}
$query;
export function icrc1_name():Result<string,string> {
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<string,string>(arg.name)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<string,string>("Some Error Occured")
    }))
}

$query;
export function icrc1_symbol(): Result<string,string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<string,string>(arg.symbol)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<string,string>("Some Error Occured")
    }))
}

$query;
export function icrc1_decimals(): Result<nat,string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<nat,string>(arg.decimals)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<nat,string>("Some Error Occured")
    }))
}


// $query;
// export function icrc1_metadata() : Result<Metadatum,string>{

//     return(match(TokenState.get(1n),{
//         Some: (arg) =>{
            
//             return Result.Ok<Metadatum,string>(arg.metadata)
//         },
//         //@note: None condition should be technically imporssinly 
//         None: () =>  Result.Err<Metadatum,string>("Some Error Occured")
//     }))
// }

$query;
export function icrc1_total_supply(): Result<nat,string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<nat,string>(arg.total_supply)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<nat,string>("Some Error Occured")
    }))
}

$query;
export function icrc1_minting_account(): Result<Opt<Account>,string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<Opt<Account>,string>(arg.minting_account)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<Opt<Account>,string>("Some Error Occured")
    }))
}

$query
export function icrc1_balance_of(Account:Account): nat{

    Account = padSubAccount(Account)
    return(match(AccountBalance.get(Account),{
        Some: (arg) =>{
            return (arg)
        },
        //@note: Returns balance of 0 if that account is not found in the storage 
        None: () =>  (0n)
    }))
}

// $query;
// export function icrc1_supported_standards(): Result<Vec<SupportedStandard>,string>{
//     return(match(TokenState.get(1n),{
//         Some: (arg) =>{
//             return Result.Ok<Vec<SupportedStandard>,string>(arg.supported_standards)
//         },
//         //@note: None condition should be technically imporssinly 
//         None: () =>  Result.Err<Vec<SupportedStandard>,string>("Error Occured")
//     }))
// }

$query;
export function icrc2_allowance(allowance_args:AllowanceArgs):Allowance{

    allowance_args.account = padSubAccount(allowance_args.account)
    allowance_args.spender = padSubAccount(allowance_args.spender)


   const Key:AllowanceKey = {
    from:allowance_args.account,
    to:allowance_args.spender
   }
   return(match(AllowanceStorage.get(Key),{
    Some:(args) => {
        return (args.Allowance)
    },
    None:() => ({allowance:0n,expires_at:Opt.None})
   })) 
}

