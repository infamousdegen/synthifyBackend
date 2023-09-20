import { Principal, StableBTreeMap,nat,Vec } from "azle";
import {VaultStorageData,IndividualVaultData} from "./types";

export let VaultStorage = new StableBTreeMap<nat,VaultStorageData>(3,2048,5_000)

export let UserVaultIdMapping = new StableBTreeMap<Principal,Vec<nat>>(4,1024,5_000)

export let IndividualVaultStorage = new StableBTreeMap<nat,IndividualVaultData>(5,2048,5_000)