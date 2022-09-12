const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Model = Sequelize.Model;

class User extends Model {}

User.init(
	{
		firstname: {
			type: Sequelize.STRING,
		},
		lastname: {
			type: Sequelize.STRING,
		},
		email: {
			type: Sequelize.STRING,
		},
		password: {
			type: Sequelize.STRING,
		},
	},
	{ sequelize, modelName: "user" }
);

module.exports = User;
