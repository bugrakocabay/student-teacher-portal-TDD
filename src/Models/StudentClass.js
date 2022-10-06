const Sequelize = require("sequelize");
const sequelize = require("../config/db");
const Class = require("./ClassModel");
const User = require("./UserModel");

const Model = Sequelize.Model;

class StudentClass extends Model {}

StudentClass.init(
	{
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				key: "id",
			},
		},
		classId: {
			type: Sequelize.INTEGER,
			references: {
				model: Class,
				key: "id",
			},
		},
		class_name: {
			type: Sequelize.TEXT,
		},
		date: {
			type: Sequelize.DATE,
		},
		teacher: {
			type: Sequelize.TEXT,
		},
		status: {
			type: Sequelize.TEXT,
		},
		description: {
			type: Sequelize.TEXT,
		},
	},
	{ sequelize, timestamps: true }
);

module.exports = StudentClass;
