const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const asyncHandler = require("../utils/asyncHandler");
const authenticate = require('../middlewares/authMiddleware')
const rolesGaurd = require('../middlewares/roleGauard')

const CONSTANTS = require('../../constants')

router.get(`/${CONSTANTS.LOGIN_ROUTE}/:mobile`, asyncHandler(authController.sendOTPForLogin));
router.post(`/${CONSTANTS.LOGIN_ROUTE}`, asyncHandler(authController.loginWithOTP));
// router.get("/test",authenticate,(req,res,next)=>rolesGaurd(req,res,next,'members-view'),(req,res)=>{
// 	res.json({result:true})
// })
module.exports = router;
