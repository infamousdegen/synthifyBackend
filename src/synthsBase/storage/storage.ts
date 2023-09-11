import { StableBTreeMap,nat,Opt,Principal, blob,Record } from "azle"
import { State,Account,AllowanceKey,AllowanceStorageData } from "../types"



//@Note: Both of these nat will be fixed at 1 
export let TokenState = new StableBTreeMap<nat,State>(0,500,5_000_000)

//To Keep Track of Account Balances . Maybe Store  it in the TokenState instead of keeping  it seperate
//If the Account balance goes belo 0 then I can remove from the state also
export let AccountBalance = new StableBTreeMap<Account,nat>(1,500,5_000_000)

export let AllowanceStorage = new StableBTreeMap<AllowanceKey,AllowanceStorageData>(2,500,1024)

