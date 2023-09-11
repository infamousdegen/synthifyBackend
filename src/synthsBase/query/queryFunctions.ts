import { AccountBalance,TokenState,AllowanceStorage } from "../storage/storage";
import { $query,match,nat,Result,Opt,$update,blob,int,Vec, Tuple,Record,ic } from "azle";
import { Account,Metadatum,SupportedStandard,AllowanceArgs,AllowanceKey, Allowance, State,AllowanceStorageData } from "../types";

import { padSubAccount } from "../helper";



$query;
export function icrc1_name():string {
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.name)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc1_symbol(): string{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.symbol)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc1_decimals(): nat{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.decimals)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc1_fee():nat{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.fee)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Error Occured")
    }))
}


$query;
export function icrc1_metadata() : Metadatum{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            
            return (arg.metadata)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc1_total_supply(): nat{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.total_supply)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc1_minting_account(): Opt<Account>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.minting_account)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
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

$query;
export function icrc1_supported_standards(): Vec<SupportedStandard>{
    return(match(TokenState.get(1n),{
        Some: (arg) =>{
            return (arg.supported_standards)
        },
        //@note: None condition should be technically imporssinly 
        None: () =>  ic.trap("Some error occured")
    }))
}

$query;
export function icrc2_allowance(allowance_args:AllowanceArgs):Allowance{

    const From:Account = padSubAccount(allowance_args.account)
    const Spender:Account = padSubAccount(allowance_args.spender)


   const Key:AllowanceKey = {
    from:From,
    to:Spender
   }

   return(match(AllowanceStorage.get(Key),{
    Some:(args) => {
        return (args.Allowance)
    },
    //change this to 0 alloance 
    None:() => {
        return {
            allowance:0n,
            expires_at:Opt.None
        }
    }
   })) 
}





