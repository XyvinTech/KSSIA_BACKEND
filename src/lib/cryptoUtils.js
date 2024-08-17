const crypto = require('crypto');

// strong algorithm
const algorithm = 'aes-256-cbc'; 
const IV_LENGTH = 16;

function encrypt(text) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(algorithm, Buffer.from(process.env.ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
	const textParts = text.split(':');
	const iv = Buffer.from(textParts.shift(), 'hex');
	const encryptedText = Buffer.from(textParts.join(':'), 'hex');
	const decipher = crypto.createDecipheriv(algorithm, Buffer.from(process.env.ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}


function secureHash(data) {
	const hash = crypto.createHash('sha256'); 
	hash.update(data);
	return hash.digest('hex');
}
function encode(str) {
    return Buffer.from(str.toString()).toString('base64');
}
function decode(encodedStr) {
    return Buffer.from(encodedStr, 'base64').toString('utf8');
}

module.exports = { encrypt, decrypt ,secureHash ,encode,decode};
