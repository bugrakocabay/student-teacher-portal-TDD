const nodemailer = require("nodemailer");
const config = require("config");
const mailConfig = config.get("mail");

const transporter = nodemailer.createTransport({ ...mailConfig });

const sendAccountActivation = async (email, token) => {
	const info = await transporter.sendMail({
		from: "My app <info@mail.com>",
		to: email,
		subject: "Account activation",
		html: `
		<div>
			<b>Please click below to activate your account</b>
		</div>	
		<div>
			<a href="http://localhost:3000/users/token/${token}"> Activate</a>
		</div>`,
	});

	if (process.env.NODE_ENV === "development") {
		console.log(`url: ${nodemailer.getTestMessageUrl(info)}`);
	}
};

module.exports = { sendAccountActivation };
