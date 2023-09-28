# How to Deploy Locally

## Deploy the Canisters
1. **Start the Local Network:**
   ```sh
   dfx start
   ```
2. **Deploy the Oracle Canister:**
   ```sh
   dfx deploy oracle
   ```
3. **Deploy the Deposit Canister:**
   ```sh
   dfx deploy deposit
   ```
4. **Deploy the VaultManager Canister:**
   ```sh
   dfx deploy vaultmanager
   ```
5. **Deploy the SynthMinter Canister:**
   ```sh
   dfx deploy synthMinter
   ```
6. **Deploy the SynBase Canister with Argument:**
   ```sh
   dfx deploy synbase --argument='(record {
       name = "Synthetic USD";                         
       symbol = "SynUsd";                           
       decimal = 8;                                           
       fee = 10;
       permitted_drift_nanos = 86_400_000_000_000;
       transaction_window_nanos = 86_400_000_000_000;                                                                                   
       minting_account = (opt record {
           owner = principal "<canister id of synthminter deployed above>";
           subaccount = null;
       });

       primary_account = (opt record {
           owner = principal "<enter your principal>";
           subaccount = null;
       });
   })'
   ```

## Further Configuration
1. **Deploy an icrc-1 Compatible Token** to mimic the behaviour of ckbtc.

2. **Update the Canister Addresses in the Codes:**
   - Mainly in `vaultmanager` code and `oracle`.

3. **Update the Canister Address of SynthMinter in VaultManager.**

4. **Update the Canister Address of Oracle in VaultManager.**

5. **Update the Canister Address of SynBase in SynthMinter.**
