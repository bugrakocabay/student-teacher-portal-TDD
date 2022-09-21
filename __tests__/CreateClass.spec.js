const request = require("supertest");
const app = require("../src/app");
const sequelize = require("../src/config/db");
const User = require("../src/Models/UserModel");
const bcrypt = require("bcryptjs");

if (process.env.NODE_ENV == "test") {
	beforeAll(async () => {
		await sequelize.sync();
	});
}

beforeEach(async () => {
	await User.destroy({ truncate: { cascade: true } });
});

const postClass = async (body = null, options = {}) => {
	let agent = request(app);
	let token;
	if (options.auth) {
		const response = await agent.post("/users/login").send(options.auth);
		token = response.body.token;
	}

	agent = request(app).post("/classes/create-class");

	if (token) {
		agent.set("Authorization", token);
	}
	if (options.token) {
		agent.set("Authorization", options.token);
	}

	return agent.send(body);
};

const activeUser = {
	firstname: "ahmet",
	lastname: "memet",
	email: "terlik@mail.com",
	inactive: false,
	password: "verystr0ngpass",
};

const addUser = async (user = { ...activeUser }) => {
	const hash = await bcrypt.hash(user.password, 10);
	user.password = hash;
	return await User.create(user);
};

describe("Create Class", () => {
	it("returns 401 when post class has no authentication", async () => {
		const response = await postClass();

		expect(response.statusCode).toBe(401);
	});

	it("returns unauthorized message when post class has no authentication", async () => {
		const response = await postClass();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns 200 when valid class submitted by authorized user", async () => {
		await addUser();
		const response = await postClass(
			{ content: "class content" },
			{ auth: { email: "terlik@mail.com", password: "verystr0ngpass" } }
		);

		expect(response.statusCode).toBe(200);
	});
});
