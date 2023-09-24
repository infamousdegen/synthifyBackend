import {
    Alias,
    ic,
    $init,
    match,
    nat32,
    $query,
    StableBTreeMap,
    $update,
    Opt,
    Variant,
    Record,
    nat64,Service,serviceUpdate,serviceQuery,CallResult, Principal, nat
} from 'azle';
import {
    HttpResponse,
    HttpTransformArgs,
    managementCanister
} from 'azle/canisters/management';
import decodeUtf8 from 'decode-utf8';

import { GetExchangeRateRequest,GetExchangeRateResult } from './types';

class exchangeRate extends Service {
    @serviceUpdate
    get_exchange_rate: (request:GetExchangeRateRequest) => CallResult<GetExchangeRateResult>

}
 const exchangeRateCanister = new exchangeRate(
    Principal.fromText("uf6dk-hyaaa-aaaaq-qaaaq-cai")
 )


$update;
export async function getBTCUSDT(): Promise<string>{
    const Request:GetExchangeRateRequest = {
        quote_asset: {
            symbol:"USD",
            class:{FiatCurrency:null}
        },
        base_asset:{
            symbol:"BTC",
            class:{Cryptocurrency:null}
        },
        timestamp:Opt.None

    }

    const result = match(await exchangeRateCanister.get_exchange_rate(Request).cycles(10_000_000_000n).call(),{
        Ok(arg) {
            return arg
        },
        Err(arg) {
            ic.trap(arg)
        },
    })

    if(result.Err !== undefined){
        ic.trap("Error occured when fetching btc price ")

    }
    const price = result.Ok.rate
    const string = parseResult(price)
    return(string)

}

const parseResult = (price:nat) => {
    let str = price.toString();
    let decimalIndex = str.length - 9;
    let result = str.slice(0, decimalIndex) + '.' + str.slice(decimalIndex);
    return result
}
$query;
export function btcPriceTranForm(args: HttpTransformArgs): HttpResponse {
    return {
        ...args.response,
        headers: []
    };
}