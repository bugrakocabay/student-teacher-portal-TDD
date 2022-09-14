const nodemailer = require("nodemailer");
//const nodemailerStub = require("nodemailer-stub");

const transporter = nodemailer.createTransport({
	host: "localhost",
	port: 8587,
	tls: {
		rejectUnauthorized: false,
	},
});

const sendAccountActivation = async (email, token) => {
	await transporter.sendMail({
		from: "My app <info@mail.com>",
		to: email,
		subject: "Account activation",
		html: `Your activation token is ${token}`,
	});
};

module.exports = { sendAccountActivation };
