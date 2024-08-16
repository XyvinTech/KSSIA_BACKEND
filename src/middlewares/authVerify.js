const jwt = require("jsonwebtoken");
const responseHandler = require("../helpers/responseHandler");

const authVerify = (req, res, next) => {
  const header = req.headers["authorization"];

  const jwtToken = header && header.split(" ")[1];

  if (!jwtToken) {
    return responseHandler(res, 401, `No token provided...!`);
  }

  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return responseHandler(res, 403, `Failed to authenticate token...!`);
    }
    
    // Correcting access to decoded token
    req.userId = decoded.userId; // Directly accessing userId from decoded payload
    return next();
  });
};

module.exports = authVerify;