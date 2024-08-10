const jwt = require('jsonwebtoken');
const cryptoUtils = require('./cryptoUtils')
const jwtHandler = {
    secret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    algorithm: 'HS256',
    accessTokenExpiration: parseInt(process.env.ACCESS_TOKEN_EXPIRY_TIME), 
    refreshTokenExpiration: parseInt(process.env.RFRESH_TOKEN_EXPIRY_TIME),

    _createToken(payload, secret, expiration) { 
		const encryptionPayload = cryptoUtils.encrypt(JSON.stringify(payload));
		const jwtPayload = {id :encryptionPayload}
        return jwt.sign(jwtPayload, secret, {
            algorithm: this.algorithm,
            expiresIn: expiration
        });
    },

    verifyToken(token, isRefreshToken = false) { 
        try {
            const secretKey = isRefreshToken ? this.refreshTokenSecret : this.secret;
            const jwtPayload = jwt.verify(token, secretKey);
			const payload = JSON.parse(cryptoUtils.decrypt(jwtPayload.id))
			return { isValid: true, payload }
        } catch (err) {
			if (err instanceof jwt.TokenExpiredError) return { isValid: false, err: 'TokenExpirederr' }
			else if (err instanceof jwt.JsonWebTokenError) return { isValid: false, error: 'JsonWebTokenError' };
			else if (err instanceof jwt.NotBeforeError) return { isValid: false, error: 'NotBeforeError' };
			return { isValid: false, error: 'InvalidTokenError' }
        }
    },

    generateTokens(payload) {
        const accessToken = this._createToken(payload, this.secret, this.accessTokenExpiration);
        const refreshToken = this._createToken(payload, this.refreshTokenSecret, this.refreshTokenExpiration);
        return { accessToken, refreshToken };
    },

    refreshTokens(refreshToken) { 
        const payload = this.verifyToken(refreshToken, true);
        return payload ? this.generateTokens(payload) : null;
    }
};

module.exports = jwtHandler;
