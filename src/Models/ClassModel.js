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
			type: Sequelize.STRING(30),
			allowNull: false,

			validate: {
				notNull: {
					msg: "class name cannot be null",
				},
				len: {
					args: [3, 30],
					msg: "class name length can be between 3-30 characters",
				},
			},
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
		description: {
			type: Sequelize.STRING,
		},
	},
	{ sequelize, modelName: "classes", timestamps: true }
);

module.exports = Class;
