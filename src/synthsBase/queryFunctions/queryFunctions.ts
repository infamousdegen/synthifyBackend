import { AccountBalance,TokenState,AllowanceStorage } from "../storage/storage";
import { $query,match,nat,Result,Opt } from "azle";
import { Account, Metadatum,SupportedStandard,AllowanceArgs,AllowanceKey, Allowance } from "../types";
import { get_account_keys } from "../helper";
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


$query;
export function icrc1_metadata() : Result<Metadatum[],string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<Metadatum[],string>(arg.metadata)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<Metadatum[],string>("Some Error Occured")
    }))
}

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
export function icrc1_balance_of(Account:Account): Result<nat,nat>{
    return(match(AccountBalance.get(Account),{
        Some: (arg) =>{
            return Result.Ok<nat,nat>(arg)
        },
        //@note: Returns balance of 0 if that account is not found in the storage 
        None: () =>  Result.Err<nat,nat>(0n)
    }))
}

$query;
export function icrc1_supported_standards(): Result<SupportedStandard[],string>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return Result.Ok<SupportedStandard[],string>(arg.supported_standards)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  Result.Err<SupportedStandard[],string>("Error Occured")
    }))
}

$query;
export function icrc2_allowance(allowance_args:AllowanceArgs):Allowance{
   const {owner_key: from_owner_key,subaccount_key: from_subaccount_key} = get_account_keys(allowance_args.account)
   const {owner_key: to_owner_key,subaccount_key: to_subaccount_key} = get_account_keys(allowance_args.spender)
   const Key:AllowanceKey = {
    [from_owner_key] : {
        [from_subaccount_key] :   {
            [to_owner_key]:to_subaccount_key
        }
    }
   }
   return(match(AllowanceStorage.get(Key),{
    Some:(args) => {
        return (args)
    },
    None:() => ({allowance:0n,expires_at:Opt.None})
   })) 
}

