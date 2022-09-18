const { verify } = require("../utils/tokenService");

const tokenAuth = async (req, res, next) => {
	const authorization = req.headers.authorization; // get token from auth header
	if (authorization) {
		//const token = authorization.substring(7); // delete "Bearer " and store the rest
		//console.log(token);
		try {
			let user = await verify(authorization);
			req.authenticatedUser = user;
		} catch (error) {}
	}
	next();
};

module.exports = tokenAuth;
