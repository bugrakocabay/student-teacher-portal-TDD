module.exports = {
	database: {
		database: "school",
		username: "sisifos",
		password: "password",
		dialect: "sqlite",
		storage: "./test.sqlite",
		logging: false,
	},
	mail: {
		host: "localhost",
		port: 8587,
		tls: {
			rejectUnauthorized: false,
		},
	},
};
