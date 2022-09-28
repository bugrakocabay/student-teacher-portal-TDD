const AppError = require("../utils/appError");
const Class = require("../Models/ClassModel");
const User = require("../Models/UserModel");

/*
 * Check if user is authenticated >> find authenticated users info in db >> if user is a "student" return Unauthorized,
 * If user is authorized, get class info from request body store them into "newClassObj".
 * Create class in db with the object, if it is success, return 200. Unless, return 400 bad request.
 */
exports.createClass = async (req, res, next) => {
  try {
    if (req.authenticatedUser) {
      const teacher = await User.findOne({
        where: { id: req.authenticatedUser.id },
      });

      if (teacher.role === "student") {
        return next(new AppError("Unauthorized", 403));
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

/*
 * Check if user is authenticated, store pagination statements into variables for later use.
 * Get all classes from db with given attributes with limits.
 * Return all to user with pages of 10.
 */
exports.getClasses = async (req, res, next) => {
  const pageSize = 10;
  let page = req.query.page ? Number.parseInt(req.query.page) : 0;
  if (page < 0) page = 0;

  const classes = await Class.findAndCountAll({
    attributes: ["id", "class_name", "date", "teacher", "status"],
    limit: pageSize,
    offset: page * pageSize,
  });

  res.render("main", {
    content: classes.rows,
    page,
    size: 10,
    totalPages: Math.ceil(classes.count / pageSize),
  }); /*
  try {
    if (req.authenticatedUser) {
      // res.send({
      // 	content: classes.rows,
      // 	page,
      // 	size: 10,
      // 	totalPages: Math.ceil(classes.count / pageSize),
      // });
    } else {
      return next(new AppError("Unauthorized", 401));
    }
  } catch (error) {
    console.log("GET ALL CLASSES ERROR " + error);
    next(error);
  }*/
};

exports.getSingleClass = async (req, res, next) => {
  try {
    if (req.authenticatedUser) {
      const singleClass = await Class.findOne({
        where: { id: req.params.id },
        attributes: ["id", "class_name", "date", "teacher", "status"],
      });
      if (!singleClass) return next(new AppError("Can't find this class", 404));

      res.send(singleClass);
    } else {
      return next(new AppError("Unauthorized", 401));
    }
  } catch (error) {
    console.log("GET SINGLE CLASS ERROR " + error);
    next(error);
  }
};

/*
 * Check if user is authenticated, >> find authenticated users info in db >> if user is a "student" return Unauthorized,
 * Get class to delete from db, if it does not exist, return 404. If the class does not belong to user, who sends the request, return 403.
 * Delete class from db and send 200 response.
 */
exports.deleteClass = async (req, res, next) => {
  try {
    if (req.authenticatedUser) {
      const teacher = await User.findOne({
        where: { id: req.authenticatedUser.id },
      });

      if (teacher.role === "student") {
        return next(new AppError("Unauthorized", 403));
      }
      try {
        let classToDelete = await Class.findOne({
          where: { id: req.params.id },
        });
        if (!classToDelete)
          return next(new AppError("Can't find this class", 404));

        if (classToDelete.userId !== teacher.id) {
          return next(new AppError("Unauthorized", 403));
        }

        await Class.destroy({ where: { id: req.params.id } });
        return res
          .status(200)
          .send({ status: "success", message: "Class deleted" });
      } catch (error) {
        console.log(error);
      }
    } else {
      return next(new AppError("Unauthorized", 401));
    }
  } catch (error) {
    console.log("DELETE CLASS ERROR " + error);
    next(error);
  }
};

/*
 * Check if user is authenticated, return 401 if not, >> find authenticated users info in db >> if user is a "student" return Unauthorized,
 * Destructure request body. Find class to update in db, if it does not exist, return 404. Check if the class does not belong to user, who sends the request, return 403.
 * Set the attributes and save it, if they pass validations return 200 success, otherwise return 400.
 */
exports.updateClass = async (req, res, next) => {
  try {
    if (!req.authenticatedUser) {
      return next(new AppError("Unauthorized", 401));
    }

    const teacher = await User.findOne({
      where: { id: req.authenticatedUser.id },
    });

    if (teacher.role === "student") {
      return next(new AppError("Unauthorized", 403));
    }

    try {
      const { class_name, date, status } = req.body;

      let classToUpdate = await Class.findOne({
        where: { id: req.params.id },
      });
      if (!classToUpdate)
        return next(new AppError("Can't find this class", 404));
      if (classToUpdate.userId !== teacher.id)
        return next(new AppError("Unauthorized", 403));

      classToUpdate.class_name = class_name;
      classToUpdate.date = date;
      classToUpdate.status = status;
      await classToUpdate.save();

      return res.send({ status: "success", message: "Updated successfully" });
    } catch (error) {
      return next(new AppError(error.errors[0].message, 400));
    }
  } catch (error) {
    console.log("UPDATE CLASS ERROR " + error);
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
