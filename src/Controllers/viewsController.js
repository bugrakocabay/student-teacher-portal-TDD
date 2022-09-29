const User = require("../Models/UserModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const { createToken } = require("../utils/tokenService");
const emailService = require("../utils/email");
const { randomString } = require("../utils/generator");

exports.loginRender = async (req, res, next) => {
	res.render("login", {
		error: req.flash("error"),
		message: req.flash("message"),
	});
};

exports.registerRender = async (req, res, next) => {
	res.render("register.ejs", { error: req.flash("error") });
};

exports.mainRender = async (req, res, next) => {
	let user = await User.findOne({ where: { id: req.authenticatedUser.id } });

	res.render("main.ejs", { user: user });
};

/*
 *  This is a duplicate login function of the in usersAuth.js. The difference is, this one is used for client to be redirected to main page,
 *  and the other is for testing.
 */
exports.loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email: email } });
		if (!user) {
			req.flash("error", "Incorrect credentials");
			res.render("login");
		} // user doesnt exist

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			req.flash("error", "Incorrect credentials");
			res.render("login");
		} // wrong password

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
		let formattedMail = email.replace(/\s+/g, "").toLowerCase();

		let user = {
			// update password and generate mail token on request body
			firstname,
			lastname,
			email: formattedMail,
			password: hashedpassword,
			role,
			activationToken: randomString(16),
		};

		try {
			let createdUser = await User.create(user);
			await emailService.sendAccountActivation(email, user.activationToken);
			req.flash(
				"message",
				"Registration successful, an activation mail has been sent to your email."
			);
			return res.redirect("/users/login");
		} catch (error) {
			//console.log(error);
			req.flash("error", error.errors[0].message);
			return res.render("register", { error: error.errors[0].message });
		}
	} catch (error) {
		//console.log(error);
		req.flash("error", "An error occured :(");
		return res.render("register", { error });
	}
};

exports.logoutUser = async (req, res, next) => {
	res.cookie("token", " ", { maxAge: 1 });
	res.redirect("/users/login");
};
