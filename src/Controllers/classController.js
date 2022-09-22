const AppError = require("../utils/appError");
const Class = require("../Models/ClassModel");

exports.createClass = async (req, res, next) => {
	try {
		if (req.authenticatedUser) {
			const { class_name, date, teacher } = req.body.classBody;
			const newClass = await Class.create({ class_name, date, teacher });

			return res
				.status(200)
				.send({ status: "success", message: "class created" });
		}

		return next(new AppError("Unauthorized", 401));
	} catch (error) {
		console.log(`CREATE CLASS ERROR ${error}`);
		next(error);
	}
};
