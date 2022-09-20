const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const Model = Sequelize.Model;

class Token extends Model {}

Token.init(
	{
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		token: {
			type: Sequelize.STRING,
		},
	},
	{ sequelize, modelName: "token" }
);

module.exports = Token;
