const crypto = require("crypto");

/*
 *  Generates a random string with given length
 */
const randomString = (length) => {
	return crypto.randomBytes(length).toString("hex").substring(0, length);
};

module.exports = { randomString };
