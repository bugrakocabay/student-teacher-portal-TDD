const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
	try {
		let hashedpassword = await bcrypt.hash(req.body.password, 10); // hash password
		let user = { ...req.body, password: hashedpassword }; // update password on request body

		if (user.firstname === null) {
			return res
				.status(400)
				.send({ validationErrors: { firstname: "firstname cannot be null" } });
		}

		let createdUser = await User.create(user); // save user to db
		return res.send({ message: "User created" });
	} catch (error) {
		console.log(error);
	}
};
