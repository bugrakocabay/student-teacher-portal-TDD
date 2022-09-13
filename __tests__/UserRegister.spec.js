const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const sequelize = require("../src/config/db");

beforeAll(() => {
	return sequelize.sync();
});

beforeEach(() => {
	return User.destroy({ truncate: true });
});

const postUser = (user = validUser) => {
	return request(app).post("/users/register").send(user);
};

const validUser = {
	firstname: "osman",
	lastname: "baba",
	email: "user1@mail.com",
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
		expect(savedUser.email).toBe("user1@mail.com");
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
				email: "user1@mail.com",
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
});
