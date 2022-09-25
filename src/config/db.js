const Sequelize = require("sequelize");
const config = require("config");

// Get database credentials from config file
const dbConfig = config.get("database");

// Establish connection with db
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
