const jwtHandler = require('../lib/jwtHandler'); 

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        const result = jwtHandler.verifyToken(token); 
        if (result.isValid) {
            req.user = result.payload; 
            return next();
        }
    }
    return res.status(401).json({ message: 'Unauthorized' });
}
module.exports = authenticate;