const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Model = Sequelize.Model;

class Class extends Model {}

Class.init(
	{
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		class_name: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		date: {
			type: Sequelize.DATE,
		},
		teacher: {
			type: Sequelize.STRING,
		},
		status: {
			type: Sequelize.ENUM("pending", "finished"),
			defaultValue: "pending",
		},
		userId: {
			type: Sequelize.INTEGER,
		},
	},
	{ sequelize, modelName: "classes", timestamps: true }
);

module.exports = Class;
