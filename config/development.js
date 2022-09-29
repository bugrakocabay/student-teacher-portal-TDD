module.exports = {
  database: {
    database: "school",
    username: "sisifos",
    password: "password",
    dialect: "sqlite",
    storage: "./development.sqlite",
    logging: false,
  },
  mail: {
    /*host: "smtp.ethereal.email",
		port: 587,
		auth: {
			user: "luther.parker@ethereal.email",
			pass: "sKGNXcJVTA8JzgSRUX",
		},*/
    service: "Yandex",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAILPASS,
    },
  },
};
