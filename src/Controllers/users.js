const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const emailService = require("../utils/email");

const generateToken = (length) => {
	return crypto.randomBytes(length).toString("hex").substring(0, length);
};

exports.createUser = async (req, res) => {
	try {
		const { firstname, lastname, email, password } = req.body;
		if (!password)
			return res
				.status(400)
				.send({ status: "fail", message: "password cannot be null" });
		if (!email) {
			return res
				.status(400)
				.send({ status: "fail", message: "email cannot be null" });
		}

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
			console.log(error);
			return res
				.status(400)
				.send({ status: "fail", message: error.errors[0].message });
		}
	} catch (error) {
		console.log(error);
		return res.status(502).send({ status: "fail", message: "email failure" });
	}
};

/* exports.getUser = async (req, res) => {
	try {
		let user = await User.findOne({ where: { email: req.body.email } });
		console.log(user);
		return res.send(user);
	} catch (error) {
		console.log(error);
	}
};
*/
