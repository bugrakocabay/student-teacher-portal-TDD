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

		return next(new AppError("Unauthorized", 403));
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

exports.deleteClass = async (req, res, next) => {
	try {
		if (req.authenticatedUser) {
			const teacher = await User.findOne({
				where: { id: req.authenticatedUser.id },
			});

			if (teacher.role === "student") {
				return next(new AppError("Unauthorized", 401));
			}
			try {
				let classToDelete = await Class.findOne({
					where: { id: req.params.id },
				});
				if (!classToDelete)
					return next(new AppError("Can't find this class", 404));

				if (classToDelete.userId !== teacher.id) {
					return next(new AppError("Unauthorized", 401));
				}

				await Class.destroy({ where: { id: req.params.id } });
				return res
					.status(200)
					.send({ status: "success", message: "Class deleted" });
			} catch (error) {
				console.log(error);
			}
		} else {
			return next(new AppError("Unauthorized", 403));
		}
	} catch (error) {
		console.log("DELETE CLASS ERROR " + error);
		next(error);
	}
};

/*const makeClass = async (num) => {
	for (i = 0; i < num; i++) {
		await Class.create({
			class_name: `class${i + 1}`,
			date: "2022-03-01 10:00:00",
			teacher: `teacher${i + 1}`,
		});
	}
};

makeClass(25);*/
