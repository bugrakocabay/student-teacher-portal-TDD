const Sequelize = require("sequelize");
const config = require("config");

const dbConfig = config.get("database");

// const sequelize = new Sequelize(
// 	`postgres://${dbConfig.DBUSER}:${dbConfig.DBPASS}@${dbConfig.DBHOST}:${dbConfig.DBPORT}/${dbConfig.DBNAME}`,
// 	{ dialect: "postgres", logging: false }
// );

const sequelize = new Sequelize(
	dbConfig.database,
	dbConfig.username,
	dbConfig.password,
	{
		dialect: dbConfig.dialect,
		storage: dbConfig.storage,
		logging: dbConfig.logging,
	}
);

module.exports = sequelize;
