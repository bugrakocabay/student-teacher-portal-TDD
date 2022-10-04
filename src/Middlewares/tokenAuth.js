const { verify } = require("../utils/tokenService");

/*
 *  Get token from cookie, if it exists, verify it. Then authenticate user.
 */
const tokenAuth = async (req, res, next) => {
	const authorization = req.cookies.token; //

	if (authorization) {
		try {
			//const token = authorization.substring(7);
			const user = await verify(authorization);

			req.authenticatedUser = user;
			req.userRole = user.role;
		} catch (error) {}
	}
	next();
};

module.exports = tokenAuth;
