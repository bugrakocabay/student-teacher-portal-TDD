const jwt = require("jsonwebtoken");

const tokenAuth = async (req, res, next) => {
	const authorization = req.headers.authorization; // get token from auth header
	if (authorization) {
		const token = authorization.substring(7); // delete "Bearer " and store the rest
		try {
			let user = await jwt.verify(token, "a-very-secret");
			req.authenticatedUser = user;
		} catch (error) {}
	}
	next();
};

module.exports = tokenAuth;
