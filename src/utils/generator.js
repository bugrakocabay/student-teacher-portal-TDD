const crypto = require("crypto");

const randomString = (length) => {
	// generate activation token
	return crypto.randomBytes(length).toString("hex").substring(0, length);
};

module.exports = { randomString };
