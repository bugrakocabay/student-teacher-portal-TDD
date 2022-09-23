const AppError = require("../utils/appError");
const Class = require("../Models/ClassModel");
const User = require("../Models/UserModel");

exports.createClass = async (req, res, next) => {
	try {
		if (req.authenticatedUser) {
			const teacher = await User.findOne({
				where: { id: req.authenticatedUser.id },
			});

			if (teacher.role === "student") {
				return next(new AppError("Unauthorized", 401));
			}
			const { class_name, date } = req.body;
			let newClassObj = {
				class_name,
				date,
				teacher: `${teacher.firstname} ${teacher.lastname}`,
				userId: teacher.id,
			};

			try {
				const newClass = await Class.create(newClassObj);

				return res
					.status(200)
					.send({ status: "success", message: "class created" });
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

exports.getClasses = async (req, res, next) => {
	try {
		if (req.authenticatedUser) {
			const pageSize = 10;
			let page = req.query.page ? Number.parseInt(req.query.page) : 0;
			if (page < 0) page = 0;

			const classes = await Class.findAndCountAll({
				attributes: ["id", "class_name", "date", "teacher", "status"],
				limit: pageSize,
				offset: page * pageSize,
			});

			res.send({
				content: classes.rows,
				page,
				size: 10,
				totalPages: Math.ceil(classes.count / pageSize),
			});
		} else {
			return next(new AppError("Unauthorized", 401));
		}
	} catch (error) {
		console.log("GET ALL CLASSES ERROR " + error);
		next(error);
	}
};
