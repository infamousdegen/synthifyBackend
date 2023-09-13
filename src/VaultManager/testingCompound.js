// Function to calculate compound interest compounded per second
function calculateContinousCompoundInterest(currentAccumulatorValue, interest, timeInSeconds) {
    
    interest = interest /100

    balance = currentAccumulatorValue * Math.pow(Math.E, interest * timeInSeconds);

    
    return balance;
  }
  
  // Principal amount: $1000
  // Annual rate: 2.5%
  // Time: 60 seconds
  const currentAccumulatorValue = 1;
  const interest = 5.5;
  const timeInSeconds = 1;
  
  const compoundedAmount = calculateContinousCompoundInterest(currentAccumulatorValue, interest, timeInSeconds);
  
  console.log(`The amount after ${timeInSeconds} seconds with an annual rate of ${interest}% is ${compoundedAmount}`);
  