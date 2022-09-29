const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const emailService = require("../utils/email");
const AppError = require("../utils/appError");
const { randomString } = require("../utils/generator");

/*
 *  Destructure request body, return error if there are any empty fields. Store input in a object with hashed password.
 * 	Send an activation mail, with a randomly generated token. If inputs pass the validation, create user and send 200.
 */
exports.createUser = async (req, res, next) => {
	try {
		const { firstname, lastname, email, password, role } = req.body;
		if (!password) return next(new AppError("password cannot be null", 400));
		if (!email) return next(new AppError("email cannot be null", 400));

		let hashedpassword = await bcrypt.hash(password, 10); // hash password
		let user = {
			// update password and generate mail token on request body
			firstname,
			lastname,
			email,
			password: hashedpassword,
			role,
			activationToken: randomString(16),
		};
		await emailService.sendAccountActivation(email, user.activationToken);

		try {
			let createdUser = await User.create(user); // save user to db
			return res.status(200).send({ message: "User created" });
		} catch (error) {
			//console.log(error);
			return next(new AppError(error.errors[0].message, 400));
		}
	} catch (error) {
		//console.log(error);
		return next(new AppError("email failure", 502));
	}
};

/*
 *  Get token from request parameters(url was sent via activation mail). Find user in db, if doesn't exist, return error.
 *  Update user status to "active" and delete token, then save it. Send 200 with message.
 */
exports.activateAccount = async (req, res, next) => {
	const token = req.params.token;
	try {
		const user = await User.findOne({ where: { activationToken: token } });
		if (!user)
			return next(
				new AppError("account is either active or the token is invalid", 400)
			);
		user.inactive = false;
		user.activationToken = null; // delete activationToken from db
		await user.save(); //save all
		return res
			.status(200)
			.send({ status: "success", message: "account activated" });
	} catch (error) {
		next(error);
	}
};

/*
 *  Get all users from db, if exist. Send users in response body with 200.
 */
exports.getUsers = async (req, res, next) => {
	try {
		let users = await User.findAll();
		if (!users) return next(new AppError("User not found", 404));
		return res.status(200).send({ status: "success", message: users });
	} catch (error) {
		next(error);
	}
};

/*
 *  Get user with id, given in request parameter if exists. Return only selected attributes from db.
 */
exports.getSingleUser = async (req, res, next) => {
	try {
		let user = await User.findOne({
			where: { id: req.params.id, inactive: false },
			attributes: ["id", "firstname", "lastname", "email"],
		});
		if (!user) return next(new AppError("User not found", 404));
		return res.status(200).send({ status: "success", message: user });
	} catch (error) {
		next(error);
	}
};

/*
	Get the authenticated user from request, which was done in authentication part.
	Unless it is authenticated or the ids don't match with request parameter's, 
	send 403 error. If it is, get the user in db, and make changes on it, then save.
*/
exports.updateUser = async (req, res, next) => {
	const authenticatedUser = req.authenticatedUser;
	const { firstname, lastname, email } = req.body;

	try {
		if (!authenticatedUser || authenticatedUser.id != req.params.id) {
			return next(new AppError("Unauthorized", 403));
		}
		const user = await User.findOne({
			where: { id: authenticatedUser.id },
		});
		user.firstname = firstname;
		user.lastname = lastname;
		user.email = email;

		await user.save();
		return res.send();
	} catch (error) {
		//console.log(`UPDATE USER ERROR ${error}`);
		next(error);
	}
};

/*
	Get the authenticated user from request. Unless it is authenticated or the 
	ids don't match with request parameter's, send 403 error. 
	If it is, get the user in db, destroy it and the tokens of the.
*/
exports.deleteUser = async (req, res, next) => {
	const authenticatedUser = req.authenticatedUser;
	try {
		if (!authenticatedUser || authenticatedUser.id != req.params.id) {
			return next(new AppError("Unauthorized", 403));
		}
		const user = await User.findOne({
			where: { id: authenticatedUser.id },
		}); // find user in db
		await User.destroy({ where: { id: authenticatedUser.id } });

		return res.send();
	} catch (error) {
		console.log(`DELETE USER ERROR ${error}`);
		next(error);
	}
};
