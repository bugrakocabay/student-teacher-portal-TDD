const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const sequelize = require("../src/config/db");
const SMTPServer = require("smtp-server").SMTPServer;

let lastMail, server;
let simulateSmtpFailure = false;

beforeAll(async () => {
	server = new SMTPServer({
		authOptional: true,
		onData(stream, session, callback) {
			let mailBody;
			stream.on("data", (data) => {
				mailBody += data.toString();
			});
			stream.on("end", () => {
				if (simulateSmtpFailure) {
					const err = new Error("Invalid mailbox");
					err.responseCode = 533;
					return callback(err);
				}
				lastMail = mailBody;
				callback();
			});
		},
	});

	await server.listen(8587, "localhost");
	await sequelize.sync();
});

beforeEach(() => {
	simulateSmtpFailure = false;
	return User.destroy({ truncate: true });
});

afterAll(async () => {
	await server.close();
});

const postUser = (user = validUser) => {
	return request(app).post("/users/register").send(user);
};

const validUser = {
	firstname: "osman",
	lastname: "baba",
	email: "user11@mail.com",
	password: "P4ssword",
};

describe("User Registration", () => {
	it("returns 200 OK when signup is valid", async () => {
		const response = await postUser();
		expect(response.status).toBe(200);
	});

	it("returns success message when signup request is valid", async () => {
		const response = await postUser();
		expect(response.body.message).toBe("User created");
	});

	it("saves user to database", async () => {
		await postUser();
		// query user table
		const userList = await User.findAll();
		expect(userList.length).toBe(1);
	});

	it("saves firstname, lastname and email to database", async () => {
		await postUser();
		// query user table
		const userList = await User.findAll();
		const savedUser = userList[0];
		expect(savedUser.firstname).toBe("osman");
		expect(savedUser.lastname).toBe("baba");
		expect(savedUser.email).toBe("user11@mail.com");
	});

	it("hashes the password in database", async () => {
		await postUser();
		// query user table
		const userList = await User.findAll();
		const savedUser = userList[0];
		expect(savedUser.password).not.toBe("P4ssword");
	});

	it.each`
		field          | expectedMessage
		${"firstname"} | ${`firstname cannot be null`}
		${"lastname"}  | ${`lastname cannot be null`}
		${"email"}     | ${`email cannot be null`}
		${"password"}  | ${`password cannot be null`}
	`(
		"returns $expectedMessage when $field is null",
		async ({ field, expectedMessage }) => {
			const user = {
				firstname: "osman",
				lastname: "baba",
				email: "user11@mail.com",
				password: "P4ssword",
			};
			user[field] = null;
			const response = await postUser(user);
			const body = response.body;
			expect(body.message).toBe(expectedMessage);
		}
	);

	it("returns error when a used email entered", async () => {
		await User.create({ ...validUser });
		const response = await postUser();

		expect(response.body.message).toBe("email is already taken");
	});

	it("creates user in inactive mode", async () => {
		await postUser();

		const users = await User.findAll();
		const savedUser = users[0];
		expect(savedUser.inactive).toBe(true);
	});

	it("creates user in inactive mode even the request body contains inactive false", async () => {
		const newUswer = { ...validUser, inactive: false };

		await postUser(newUswer);

		const users = await User.findAll();
		const savedUser = users[0];
		expect(savedUser.inactive).toBe(true);
	});

	it("creates an activation token for user", async () => {
		await postUser();

		const users = await User.findAll();
		const savedUser = users[0];
		expect(savedUser.activationToken).toBeTruthy();
	});

	it("sends an activation mail with token", async () => {
		await postUser();

		const users = await User.findAll();
		const savedUser = users[0];
		expect(lastMail).toContain("user11@mail.com");
		expect(lastMail).toContain(savedUser.activationToken);
	});

	it("returns 502 Bad Gateway when sending email fails", async () => {
		simulateSmtpFailure = true;
		// const mockSendActivation = jest
		// 	.spyOn(emailService, "sendAccountActivation")
		// 	.mockRejectedValue({ message: "Failed to deliver email" });
		const response = await postUser();
		expect(response.status).toBe(502);
		//mockSendActivation.mockRestore();
	});

	it("returns Email failure message when sending email fails", async () => {
		simulateSmtpFailure = true;
		const response = await postUser();
		expect(response.body.message).toBe("email failure");
	});

	it("does not save user to db if activation email fails", async () => {
		simulateSmtpFailure = true;

		await postUser();

		const users = await User.findAll();
		expect(users.length).toBe(0);
	});
});

describe("Account Activation", () => {
	it("activates the account when correct token is sent", async () => {
		await postUser();

		let users = await User.findAll();
		let token = users[0].activationToken;

		await request(app)
			.post("/users/token/" + token)
			.send();
		users = await User.findAll();
		expect(users[0].inactive).toBe(false);
	});

	it("removes the token from user table after the activation", async () => {
		await postUser();
		let users = await User.findAll();
		const token = users[0].activationToken;

		await request(app)
			.post("/users/token/" + token)
			.send();

		users = await User.findAll();
		expect(users[0].activationToken).toBeFalsy();
	});

	it("does not activate account when token is not correct", async () => {
		await postUser();
		const token = "this-token-does-not-exist";

		await request(app)
			.post("/users/token/" + token)
			.send();

		let users = await User.findAll();
		expect(users[0].inactive).toBe(true);
	});

	it("returns bad request when token is not correct", async () => {
		await postUser();
		const token = "this-token-does-not-exist";

		let response = await request(app)
			.post("/users/token/" + token)
			.send();

		expect(response.status).toBe(400);
	});

	it("returns message when token is not correct", async () => {
		await postUser();
		const token = "this-token-does-not-exist";

		let response = await request(app)
			.post("/users/token/" + token)
			.send();

		expect(response.body.message).toBe(
			"account is either active or the token is invalid"
		);
	});
});
