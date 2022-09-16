const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const sequelize = require("../src/config/db");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
	await sequelize.sync();
});

beforeEach(async () => {
	await User.destroy({ truncate: true });
});

const activeUser = {
	firstname: "semsiye",
	lastname: "patates",
	email: "araba@mail.com",
	inactive: false,
	password: "verystr0ngpass",
};
const addUser = async (user = { ...activeUser }) => {
	const hash = await bcrypt.hash(user.password, 10);
	user.password = hash;
	return await User.create(user);
};

const postAuthentication = async (credentials) => {
	return await request(app).post("/users/login").send(credentials);
};

describe("Authentication", () => {
	it("returns 200 when credentials are correct", async () => {
		await addUser();
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.statusCode).toBe(200);
	});

	it("returns only user id,firstname and lastname when login success", async () => {
		const user = await addUser();
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});

		expect(response.body.id).toBe(user.id);
		expect(response.body.firstname).toBe(user.firstname);
		expect(response.body.lastname).toBe(user.lastname);
		expect(Object.keys(response.body)).toEqual(["id", "firstname", "lastname"]);
	});

	it("returns 401 when user does not exist", async () => {
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.statusCode).toBe(401);
	});

	it("returns error body when user does not exist", async () => {
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.body.message).toBe("Incorrect credentials");
	});

	it("returns 401 when password is wrong", async () => {
		await addUser();
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "wrongpassword",
		});
		expect(response.statusCode).toBe(401);
	});

	it("returns 403 when logging with an inactive account", async () => {
		await addUser({ ...activeUser, inactive: true });
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.statusCode).toBe(403);
	});

	it("returns error message logging with an inactive account", async () => {
		await addUser({ ...activeUser, inactive: true });
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.body.message).toBe("Please activate your account");
	});

	it("returns 401 when email is not valid", async () => {
		await addUser();
		const response = await postAuthentication({
			email: "WRONG@mail.com",
			password: "verystr0ngpass",
		});
		expect(response.statusCode).toBe(401);
	});
});
