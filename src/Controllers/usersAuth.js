const User = require("../Models/UserModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const { createToken, deleteToken } = require("../utils/tokenService");

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
		//res.redirect("/classes");
		res.status(200).send({
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			token,
		});
	} catch (error) {
		next(error);
	}
};

exports.logoutUser = async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (authorization) {
		await deleteToken(authorization);
	}

	res.send();
};
