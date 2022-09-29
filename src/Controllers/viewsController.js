const User = require("../Models/UserModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const { createToken } = require("../utils/tokenService");
const emailService = require("../utils/email");
const { randomString } = require("../utils/generator");

exports.loginRender = async (req, res, next) => {
	res.render("login.ejs");
};

exports.registerRender = async (req, res, next) => {
	res.render("register.ejs");
};

exports.mainRender = async (req, res, next) => {
	res.render("main.ejs");
};

/*
 *  This is a duplicate login function of the in usersAuth.js. The difference is, this one is used for client to be redirected to main page,
 *  and the other is for testing.
 */
exports.loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email: email } });
		if (!user) return next(new AppError("Incorrect credentials", 401)); // user doesnt exist

		const match = await bcrypt.compare(password, user.password);
		if (!match) return next(new AppError("Incorrect credentials", 401)); // wrong password

		if (user.inactive)
			return next(new AppError("Please activate your account", 403));

		const token = await createToken(user);

		res.cookie("token", token);
		res.redirect("/classes");
	} catch (error) {
		next(error);
	}
};

/*
 *  This is also a duplicate register function of the in users.js. The difference is, this one is used for client to be redirected to login page,
 *  and the other is for testing.
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
			return res.redirect("/users/login");
		} catch (error) {
			//console.log(error);
			return next(new AppError(error.errors[0].message, 400));
		}
	} catch (error) {
		//console.log(error);
		return next(new AppError("email failure", 502));
	}
};
