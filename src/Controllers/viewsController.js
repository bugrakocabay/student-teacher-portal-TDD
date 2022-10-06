const User = require("../Models/UserModel");
const Class = require("../Models/ClassModel");
const StudentClass = require("../Models/StudentClass");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const emailService = require("../utils/email");
const { createToken } = require("../utils/tokenService");
const { randomString } = require("../utils/generator");

exports.loginRender = async (req, res, next) => {
	try {
		res.render("login.ejs", { message: req.flash("message") });
	} catch (error) {
		console.log(error);
	}
};

exports.registerRender = async (req, res, next) => {
	res.render("register.ejs");
};

exports.classRender = async (req, res, next) => {
	try {
		let user = await User.findOne({ where: { id: req.authenticatedUser.id } });
		let myClass = await Class.findOne({ where: { id: req.params.id } });

		res.render("class.ejs", { user: user, myClass: myClass });
	} catch (error) {
		console.log(error);
	}
};

exports.mainRender = async (req, res, next) => {
	try {
		let user = await User.findOne({ where: { id: req.authenticatedUser.id } });

		res.render("main.ejs", { user: user });
	} catch (error) {
		console.log(error);
	}
};

exports.createClassPage = async (req, res, next) => {
	try {
		let user = await User.findOne({ where: { id: req.authenticatedUser.id } });

		res.render("create-class.ejs", { user: user });
	} catch (error) {
		console.log(error);
	}
};

exports.userPageRender = async (req, res, next) => {
	try {
		let user = await User.findOne({ where: { id: req.authenticatedUser.id } });
		let myClass = await StudentClass.findAll({
			where: { userId: req.authenticatedUser.id },
		});

		res.render("user.ejs", { user: user, myClass: myClass });
	} catch (error) {
		console.log(error);
	}
};
/*
 *  This is a duplicate login function of the in usersAuth.js. The difference is, this one is used for client to be redirected to main page,
 *  and the other is for testing.
 */
exports.loginUser = async (req, res, next) => {
	let errors = [];
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email: email } });
		if (!user) errors.push({ message: "Incorrect credentials" });

		const match = await bcrypt.compare(password, user.password);

		if (!match) errors.push({ message: "Incorrect credentials" });
		if (user.inactive) errors.push({ message: "Please activate your account" });

		if (errors.length > 0) {
			return res.render("login", { errors });
		} else {
			const token = await createToken(user);

			res.cookie("token", token);
			return res.redirect("/classes");
		}
	} catch (error) {
		errors.push({ message: "An error occured :(" });
		return res.render("login.ejs", { errors });
	}
};

/*
 *  This is also a duplicate register function of the in users.js. The difference is, this one is used for client to be redirected to login page,
 *  and the other is for testing.
 */
exports.createUser = async (req, res, next) => {
	let errors = [];
	try {
		const { firstname, lastname, email, password, role } = req.body;

		if (!firstname || !lastname || !password || !email)
			errors.push("Please fill all the fields");

		if (errors.length > 0) res.render("register", { errors });

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
			await emailService.sendAccountActivation(
				formattedMail,
				user.activationToken
			);
			req.flash(
				"message",
				"Registration successful, an activation mail has been sent to your e-mail!"
			);
			return res.redirect("/users/login");
		} catch (error) {
			//console.log(error);
			errors.push({ message: error.errors[0].message });
			return res.render("register", { errors });
		}
	} catch (error) {
		//console.log(error);
		errors.push({ message: "An error occured :(" });
		return res.render("register", { errors });
	}
};

exports.logoutUser = async (req, res, next) => {
	res.cookie("token", " ", { maxAge: 1 });
	res.redirect("/users/login");
};

exports.activationSuccess = async (req, res, next) => {
	const token = req.params.token;
	try {
		const user = await User.findOne({ where: { activationToken: token } });
		if (!user) return res.render("activationFail.ejs");
		user.inactive = false;
		user.activationToken = null; // delete activationToken from db
		await user.save(); //save all
		return res.render("activationSuccess.ejs");
	} catch (error) {
		next(error);
	}
};

exports.createClass = async (req, res, next) => {
	try {
		if (req.authenticatedUser) {
			const teacher = await User.findOne({
				where: { id: req.authenticatedUser.id },
			});

			if (teacher.role === "student") {
				return next(new AppError("Unauthorized", 403));
			}
			const { class_name, date, description } = req.body;
			let newClassObj = {
				class_name,
				date,
				teacher: `${teacher.firstname} ${teacher.lastname}`,
				userId: teacher.id,
				description,
			};
			try {
				const newClass = await Class.create(newClassObj);

				return res.redirect("/classes");
			} catch (error) {
				return next(new AppError(error.errors[0].message, 400));
			}
		}

		return next(new AppError("Unauthorized", 401));
	} catch (error) {
		console.log(`CREATE CLASS ERROR ${error}`);
		next(error);
	}
};

exports.joinClass = async (req, res, next) => {
	try {
		if (!req.authenticatedUser) return next(new AppError("Unauthorized", 401));
		if (req.userRole === "teacher")
			return next(new AppError("Teachers can't join classes", 403));
		const find = await StudentClass.findOne({
			where: { classId: req.params.id, userId: req.authenticatedUser.id },
		});
		if (find)
			return next(new AppError("You have already joined this class", 400));
		let oldClass = await Class.findOne({ where: { id: req.params.id } });

		let newJoin = await StudentClass.create({
			userId: req.authenticatedUser.id,
			classId: req.params.id,
			class_name: oldClass.class_name,
			date: oldClass.date,
			teacher: oldClass.teacher,
			status: oldClass.status,
			description: oldClass.description,
		});

		res.redirect("/classes");
	} catch (error) {
		console.log("JOIN CLASS ERROR " + error);
		next(error);
	}
};
