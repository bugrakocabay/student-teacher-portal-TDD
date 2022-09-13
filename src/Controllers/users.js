const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
	try {
		const { firstname, lastname, email, password } = req.body;
		if (!password)
			return res
				.status(400)
				.send({ status: "fail", message: "password cannot be null" });

		let hashedpassword = await bcrypt.hash(password, 10); // hash password
		let user = { firstname, lastname, email, password: hashedpassword }; // update password on request body

		let createdUser = await User.create(user); // save user to db
		return res.send({ message: "User created" });
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.send({ status: "fail", message: error.errors[0].message });
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
