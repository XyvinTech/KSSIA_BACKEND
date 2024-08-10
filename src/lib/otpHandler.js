const crypto = require('crypto');
const cryptoUtils = require('../lib/cryptoUtils')
const generateOTP = (length = 6) => { 

  const buffer = crypto.randomBytes(Math.ceil(length / 2)); 
  const hexString = buffer.toString('hex').slice(0, length);
  const otp = parseInt(hexString, 16) % Math.pow(10, length);
  return `${otp}`.length == length ? `${otp}` :generateOTP(length); 
}

const sendOtp = async (mobile, otp) => {
    console.log(`Sending OTP ${otp} to mobile number ${mobile}`);
    // Simulate sending OTP
    return { status: true}; // Replace with actual status from your SMS service
};
const verifyOTP = async ( enteredOtp,storedHash,expiry) => {
	
	const enteredHash = cryptoUtils.secureHash(enteredOtp)
	const isMatch = enteredHash === storedHash;
	if (!isMatch) return { status: false, message: "Incorrect OTP" };
	const isExpired = Date.now() > expiry;
	if (isExpired) return { status: false, message: "OTP has expired" };
	return { status: true };
  }
  
module.exports = { generateOTP ,sendOtp,verifyOTP}