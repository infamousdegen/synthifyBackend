// const ONE_QUADRILLION = BigInt(1000000000000000); // 10^15

// // Simple BigInt power function
// function bigIntPow(base, exponent) {

//   return base**exponent;
// }

// // Function to calculate current interest accumulator with fixed-point arithmetic
// function calculateCurrentInterestAccumulator(currentCumulator, annualRate, timeInSeconds) {
//   const n = BigInt(365 * 24 * 60 * 60); // Number of times interest is compounded per year
  
//   // Convert annualRate to rate per second
//   const ratePerSecond = annualRate / n;
  
//   // Calculate the new rate factor for the given timeInSeconds
//   const rateFactor = bigIntPow(ONE_QUADRILLION + ratePerSecond, timeInSeconds);
  
//   // Calculate the new accumulator value
//   const newAccumulatorValue = (currentCumulator * rateFactor) / ONE_QUADRILLION;  // Divide by 10^15 to adjust for scaling
  
//   return newAccumulatorValue;
// }

// // Exported function to calculate new accumulator
// function calculatenewAccumulator(currentCumulator, annualRate, timeInSeconds) {
//   const newAccumulatorValue = calculateCurrentInterestAccumulator(BigInt(currentCumulator), BigInt(annualRate), BigInt(timeInSeconds));
//   return newAccumulatorValue;
// }

// // Example usage
// const currentCumulator = 1000000000000000n; // equivalent to 1 scaled by 10^15
// const annualRate = 25000000000000n; // equivalent to 2.5% scaled by 10^15
// const timeInSeconds = 31536000n; // equivalent to one year in seconds

// const newAccumulatorValue = calculatenewAccumulator(currentCumulator, annualRate, timeInSeconds);
// console.log(`The new accumulator value is ${newAccumulatorValue}`);

// console.log(97530992n*BigInt(10**-8))
// 31536000

// function calculateNewAccumulator(currentAccumulator,interestPerSecond,timeInSeconds) {
//     const newAmount = currentAccumulator*(interestPerSecond**timeInSeconds)
//     return parseFloat(newAmount.toFixed(8))
// }

// // const integer = BigInt(calculateNewAccumulator(1,1.0000000007829976090829093519527471510922262217819607847470,31536000)*(10**8))
// const result = BigInt(Math.round(1.025 * Math.pow(10, 8)));
const numberator = Number(100000000n)
const denominator = Number(102500000n)
console.log(numberator/denominator)
// const value = 10000000000/102500000;
// console.log(value)
// console.log(value/Math.pow(10,8))

// console.log(97.5609756097561 * 1.025)