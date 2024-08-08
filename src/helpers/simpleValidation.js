const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/; 

function isValidIndianPhoneNumber(phoneNumber) {
    return phoneRegex.test(phoneNumber) ;
}
function isValidOTPEntry(enteredOTP, length = 6) {
	const otpRegex = new RegExp(`^\\d{${length}}$`); 
	return otpRegex.test(enteredOTP);
}
  
module.exports = {isValidIndianPhoneNumber,isValidOTPEntry}
