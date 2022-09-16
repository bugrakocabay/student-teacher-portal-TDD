const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailService = require("../utils/email");
const AppError = require("../utils/appError");

const generateToken = (length) => {
	// generate activation token
	return crypto.randomBytes(length).toString("hex").substring(0, length);
};

exports.createUser = async (req, res, next) => {
	try {
		const { firstname, lastname, email, password } = req.body;
		if (!password) return next(new AppError("password cannot be null", 400));
		if (!email) return next(new AppError("email cannot be null", 400));

		let hashedpassword = await bcrypt.hash(password, 10); // hash password
		let user = {
			// update password and generate mail token on request body
			firstname,
			lastname,
			email,
			password: hashedpassword,
			activationToken: generateToken(16),
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

exports.activateAccount = async (req, res, next) => {
	const token = req.params.token;
	try {
		const user = await User.findOne({ where: { activationToken: token } });
		if (!user)
			// if cant find token return error
			return next(
				new AppError("account is either active or the token is invalid", 400)
			);
		user.inactive = false; // user status is active now
		user.activationToken = null; // delete activationToken from db
		await user.save(); //save all
		return res
			.status(200)
			.send({ status: "success", message: "account activated" });
	} catch (error) {
		next(error);
	}
};

exports.getUsers = async (req, res, next) => {
	try {
		let users = await User.findAll();
		if (!users) return next(new AppError("User not found", 404));
		return res.status(200).send({ status: "success", message: users });
	} catch (error) {
		next(error);
	}
};

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

exports.updateUser = async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (authorization) {
		const encoded = authorization.substring(6); // get encoded from auth header
		const decoded = Buffer.from(encoded, "base64").toString("ascii"); // decode it
		const [email, password] = decoded.split(":"); // destructure it
		const user = await User.findOne({ where: { email: email } }); // find user in db

		if (!user) return next(new AppError("User not found", 403));
		if (user.id != req.params.id)
			return next(new AppError("Unauthorized", 403));
		if (user.inactive) return next(new AppError("Unauthorized", 403));

		const match = await bcrypt.compare(password, user.password);
		if (!match) return next(new AppError("Unauthorized", 403));

		return res.send();
	}
	return res.status(403).send({ status: "fail", message: "Unauthorized" });
};
