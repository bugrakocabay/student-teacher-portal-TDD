const Sequelize = require("sequelize");

const sequelize = new Sequelize(
	"postgres://postgres:sisifos@localhost:5432/school",
	{ dialect: "postgres", logging: false }
);

module.exports = sequelize;
