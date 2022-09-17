const User = require("../Models/UserModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomString } = require("../utils/generator");
const Token = require("../Models/TokenModel");

exports.loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email: email } });
		if (!user) return next(new AppError("Incorrect credentials", 401)); // user doesnt exist

		const match = await bcrypt.compare(password, user.password);
		if (!match) return next(new AppError("Incorrect credentials", 401)); // wrong password

		if (user.inactive)
			return next(new AppError("Please activate your account", 403));

		const token = jwt.sign({ id: user.id }, "a-very-secret", {
			expiresIn: "2d",
		});
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
