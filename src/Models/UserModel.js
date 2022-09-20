const Sequelize = require("sequelize");
const sequelize = require("../config/db");
const Class = require("./ClassModel");
const Token = require("./TokenModel");

const Model = Sequelize.Model;

class User extends Model {}

User.init(
	{
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		firstname: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "firstname cannot be null",
				},
			},
		},
		lastname: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "lastname cannot be null",
				},
			},
		},
		email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: {
				arg: true,
				msg: "email is already taken",
			},
			validate: {
				notNull: {
					msg: "email cannot be null",
				},
				isEmail: {
					msg: "must be a valid email",
				},
			},
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notNull: {
					msg: "password cannot be null",
				},
			},
		},
		inactive: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
		activationToken: {
			type: Sequelize.STRING,
		},
	},
	{ sequelize, modelName: "user", timestamps: true }
);
User.hasMany(Token, { onDelete: "cascade", foreignKey: "userId" });

User.hasMany(Class);
Class.belongsTo(User, {
	foreignKey: "userId",
});

sequelize.sync();

module.exports = User;
