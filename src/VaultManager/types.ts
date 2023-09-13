import {Principal, Record,float64,nat,Vec,Alias, Service, serviceUpdate, Variant, blob} from "azle"


export type VaultMetadata = Record<{
    CollateralName:string,
    DebtTokeName:string,
}>

export type VaultStateData = Record<{
    collaterisationRatio:float64,
    interestFeePercentage:float64,
    CollateralPrincipal:Principal,
    DebtTokenPrincipal:Principal,
    priimary_owner:Principal,
    oracle:Principal,
    currentAccumulatorValue:float64
}>

export type AdministrativeData = Record<{
    priimary_owner:Principal,
    guardians:Vec<Principal>
}>

export type VaultStorageData = Record<{
    VaultMedata:VaultMetadata,
    VaultStateData:VaultStateData
    AdministrativeData:AdministrativeData
    vaultCounter:nat
    Transactions:Vec<IndividualVaultData>
}>

export type IndividualVaultData = Record<{
    normalisedDebt:float64,
    VaultCreationTime:nat,
    primaryOwner:Principal,
    vaultCollaterisationRatio:float64
    vaultCurrentCollateral:float64,
    vaultId:nat,
    //when there is some kind of debt left for this vault then it should be turned into bool
    isActive:boolean,
    memo:blob

}>

export type UserVaultIdMapping = Record<{
    Owner:Principal,
    VaultIds:Vec<nat>
}>

export type Kind = Variant<{
    VaultCreate:null
}>

export type initDate = Alias<VaultStorageData>



