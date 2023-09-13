import {
    Alias,
    ic,
    $init,
    match,
    nat32,
    $query,
    StableBTreeMap,
    $update,
    Opt
} from 'azle';
import {
    HttpResponse,
    HttpTransformArgs,
    managementCanister
} from 'azle/canisters/management';
import decodeUtf8 from 'decode-utf8';




$update;
export async function getBTCUSDT(): Promise<string> {
    const httpResult = await managementCanister
        .http_request({
            url: "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT",
            max_response_bytes: Opt.Some(2_000n),
            method: {
                get: null
            },
            headers: [],
            body: Opt.None,
            transform: Opt.Some({
                function:[ic.id(),'btcPriceTranForm'],
                context: Uint8Array.from([])


            })
        })
        .cycles(50_000_000n)
        .call();

    return(match(httpResult,{
        Ok:(httpResponse) =>JSON.parse(decodeUtf8(Uint8Array.from(httpResponse.body))).price,
        Err:(Err) => Err
    }))
}


$query;
export function btcPriceTranForm(args: HttpTransformArgs): HttpResponse {
    return {
        ...args.response,
        headers: []
    };
}