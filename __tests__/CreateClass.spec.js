const request = require("supertest");
const app = require("../src/app");
const sequelize = require("../src/config/db");
const User = require("../src/Models/UserModel");
const Class = require("../src/Models/ClassModel");
const bcrypt = require("bcryptjs");

if (process.env.NODE_ENV == "test") {
	beforeAll(async () => {
		await sequelize.sync();
	});
}

beforeEach(async () => {
	await User.destroy({ truncate: { cascade: true } });
	await Class.destroy({ truncate: { cascade: true } });
});

const credentials = { email: "terlik@mail.com", password: "verystr0ngpass" };
const classBody = {
	class_name: "computer science",
	date: "2022-12-12 12:00:00",
	teacher: "osman teacher",
};

const postClass = async (body = classBody, options = {}) => {
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
			{ classBody },
			{ auth: { email: "terlik@mail.com", password: "verystr0ngpass" } }
		);

		expect(response.statusCode).toBe(200);
	});

	it("returns success message when valid class submitted by authorized user", async () => {
		await addUser();
		const response = await postClass({ classBody }, { auth: credentials });

		expect(response.body.message).toBe("class created");
	});

	it("saves class user to database when authorized user sends valid request", async () => {
		await addUser();
		await postClass({ classBody }, { auth: credentials });

		const classes = await Class.findAll();

		expect(classes.length).toBe(1);
	});
});
