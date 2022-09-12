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

describe("User Registration", () => {
	const postValidUser = () => {
		return request(app).post("/users/register").send({
			firstname: "osman",
			lastname: "baba",
			email: "user1@mail.com",
			password: "P4ssword",
		});
	};

	it("returns 200 OK when signup is valid", async () => {
		const response = await postValidUser();
		expect(response.status).toBe(200);
	});

	it("returns success message when signup request is valid", async () => {
		const response = await postValidUser();
		expect(response.body.message).toBe("User created");
	});

	it("saves user to database", async () => {
		await postValidUser();
		// query user table
		const userList = await User.findAll();
		expect(userList.length).toBe(1);
	});

	it("saves firstname, lastname and email to database", async () => {
		await postValidUser();
		// query user table
		const userList = await User.findAll();
		const savedUser = userList[0];
		expect(savedUser.firstname).toBe("osman");
		expect(savedUser.lastname).toBe("baba");
		expect(savedUser.email).toBe("user1@mail.com");
	});

	it("hashes the password in database", async () => {
		await postValidUser();
		// query user table
		const userList = await User.findAll();
		const savedUser = userList[0];
		expect(savedUser.password).not.toBe("P4ssword");
	});
});
