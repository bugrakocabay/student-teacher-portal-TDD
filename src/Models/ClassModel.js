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
			defaultValue: new Date().toJSON,
		},
	},
	{ sequelize, timestamps: true }
);

module.exports = Class;
