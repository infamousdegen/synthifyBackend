import { float32, nat,nat32,float64 } from "azle";

// const pow = (base:nat32, exponent:nat32) => base ** exponent;

export function calculateNewAccumulator(currentAccumulator:float64,interestPerSecond:float64,timeInSeconds:nat32):float64 {
    const newAmount:float64 = currentAccumulator*(interestPerSecond**timeInSeconds)
    return parseFloat(newAmount.toFixed(8))
}



  


