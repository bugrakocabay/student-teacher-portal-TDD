const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const sequelize = require("../src/config/db");

if (process.env.NODE_ENV == "test") {
	beforeAll(async () => {
		await sequelize.sync();
	});
}

beforeEach(async () => {
	await User.destroy({ truncate: { cascade: true } });
});

describe("Listing Users", () => {
	it("returns 200 ok when there are user in database", async () => {
		const response = await request(app).get("/api/v1/users");
		expect(response.status).toBe(200);
	});
});

describe("Get User", () => {
	const getUser = (id = 5) => {
		return request(app).get("/api/v1/users/" + id);
	};

	it("returns 404 when user not found", async () => {
		const response = await getUser();
		expect(response.status).toBe(404);
	});

	it("returns User not found message when user not found", async () => {
		const response = await getUser();
		expect(response.body.message).toBe("User not found");
	});

	it("returns OK Status 200 when an active user exist", async () => {
		const user = await User.create({
			firstname: "osman",
			lastname: "baba",
			email: "user1@mail.com",
			password: "P4ssword",
			inactive: false,
		});

		const response = await getUser(user.id);
		expect(response.statusCode).toBe(200);
	});

	it("returns id,firstname,lastname,email in user body", async () => {
		const user = await User.create({
			firstname: "osman",
			lastname: "baba",
			email: "user12@mail.com",
			password: "P4ssword",
			inactive: false,
		});
		const response = await getUser(user.id);
		expect(Object.keys(response.body.message)).toEqual([
			"id",
			"firstname",
			"lastname",
			"email",
		]);
	});

	it("returns 404 when user is inactive", async () => {
		const user = await User.create({
			firstname: "osman",
			lastname: "baba",
			email: "user21@mail.com",
			password: "P4ssword",
			inactive: true,
		});

		const response = await getUser(user.id);
		expect(response.statusCode).toBe(404);
	});
});
