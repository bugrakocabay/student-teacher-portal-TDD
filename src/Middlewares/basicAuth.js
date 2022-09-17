const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

/*
    Here get the authorization from request headers. If it exists,
    decode it and get email and password. Then search email it in db.
    If it exists and the user is active, match the password with
    the hashed one. If it matches, authenticate user in the request,
    so it can be used later.
*/

// const basicAuth = async (req, res, next) => {
// 	const authorization = req.headers.authorization;
// 	if (authorization) {
// 		const encoded = authorization.substring(6); // get encoded from auth header
// 		const decoded = Buffer.from(encoded, "base64").toString("ascii"); // decode it
// 		const [email, password] = decoded.split(":"); // destructure it
// 		const user = await User.findOne({ where: { email: email } }); // find user in db

// 		if (user && !user.inactive) {
// 			const match = await bcrypt.compare(password, user.password); // if pass doesn't match
// 			if (match) {
// 				req.authenticatedUser = user;
// 			}
// 		}
// 	}
// 	next();
// };

// module.exports = basicAuth;
