const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const validationHandler = require('../helpers/simpleValidation');
const otpHandler = require('../lib/otpHandler');
const cryptoUtils = require('../lib/cryptoUtils')
const jwtHandler = require('../lib/jwtHandler')

exports.sendOTPForLogin = async (req, res) => {

    if(!_validateLoginReq(req.params)) return responseHandler(res,400,"Invalid request");
    
    const { mobile } = req.params;
    const user = await User.findOne({ "phone_numbers.personal": mobile })
  .populate("role")
  .exec();
      
    if (!user) return responseHandler(res, 404, "User not found");
	if(user.otp &&  Date.now() < user.otpExpiration) return responseHandler(res,200,"OTP already sent")
    const otp = otpHandler.generateOTP();
    // Send the OTP to the user's mobile number using OTP service 
    const sendRes = await otpHandler.sendOtp(mobile, otp);
    if(!sendRes.status) return responseHandler(res, 400, "Failed to sent OTP");
    const otpExpiration = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_TIME));
    user.otp = cryptoUtils.secureHash(otp);
    user.otpExpiration = otpExpiration
    await user.save();                                      
    return responseHandler(res, 200, "OTP sent successfully");
        
}

exports.loginWithOTP = async (req, res) => {
    
    const { mobile, otp } = req.body;

    if (!mobile || !otp) return responseHandler(res, 400, "Invalid request");

    const user = await User.findOne({ "phone_numbers.personal": mobile })
    .populate("role")
    .exec();
    if (!user) return responseHandler(res, 404, "User not found");
    const verifyRes = await otpHandler.verifyOTP(`${otp}`,user.otp,user.otpExpiration)

    if(!verifyRes.status) return responseHandler(res, 400, verifyRes.message)
    
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();
	// create jwt token
	const payload = {id : user._id,role:user.role}
	const { accessToken, refreshToken } = jwtHandler.generateTokens(payload)
	res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict',maxAge: parseInt(process.env.RFRESH_TOKEN_EXPIRY_TIME) 
        // secure: true, 
    });
    return res.json({status:true,accessToken});
};

exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return responseHandler(res, 401, 'Refresh token not provided'); 
	// check refresh token is whitlisted (check DB)
	const {isValid,payload} = jwtHandler.verifyToken(refreshToken, true);
	if(!isValid) return responseHandler(res,401,'Not a Valid Token');

	const Newpayload = { id: payload.id, role: payload.role }; 
	const { accessToken, newRefreshToken } = jwtHandler.generateTokens(Newpayload);

	// add this token to whitlist
	res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', 
maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_TIME),
		// secure: true, 
	});
	return responseHandler(res, 200, {accessToken: accessToken}); 
   
};
const _validateLoginReq = (body) => {
    return body.mobile && validationHandler.isValidIndianPhoneNumber(body.mobile)
};