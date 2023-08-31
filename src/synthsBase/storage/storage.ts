import { StableBTreeMap,nat } from "azle"
import { State,Account,AllowanceKey,Allowance,AllowanceStorageData } from "../types"

//@Note: Both of these nat will be fixed at 1 
export const TokenState = new StableBTreeMap<nat,State>(0,44,1024)

//To Keep Track of Account Balances . Maybe Store  it in the TokenState instead of keeping  it seperate
//If the Account balance goes belo 0 then I can remove from the state also
export const AccountBalance = new StableBTreeMap<Account,nat>(1,44,1024)

export const AllowanceStorage = new StableBTreeMap<AllowanceKey,AllowanceStorageData>(2,44,1024)