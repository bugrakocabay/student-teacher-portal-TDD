const { verify } = require("../utils/tokenService");

const tokenAuth = async (req, res, next) => {
	const authorization = req.cookies.token; // get token from auth header

	if (authorization) {
		try {
			//const token = authorization.substring(7);
			const user = await verify(authorization);

			req.authenticatedUser = user;
		} catch (error) {}
	}
	next();
};

module.exports = tokenAuth;
