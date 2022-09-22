const request = require("supertest");
const app = require("../src/app");
const sequelize = require("../src/config/db");
const User = require("../src/Models/UserModel");
const Class = require("../src/Models/ClassModel");
const Token = require("../src/Models/TokenModel");
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
		await addUser({ ...activeUser, role: "teacher" });
		const response = await postClass(classBody, {
			auth: credentials,
		});

		expect(response.statusCode).toBe(200);
	});

	it("returns success message when valid class submitted by authorized user", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await postClass(classBody, {
			auth: credentials,
		});

		expect(response.body.message).toBe("class created");
	});

	it("saves class user to database when authorized user sends valid request", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		await postClass(classBody, {
			auth: credentials,
		});

		const classes = await Class.findAll();

		expect(classes.length).toBe(1);
	});

	it("returns 401 when a student tries to create class", async () => {
		await addUser();
		const response = await postClass(classBody, {
			auth: credentials,
		});

		expect(response.statusCode).toBe(401);
	});

	it("returns 400 when incorrect class data posted", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await postClass(
			{
				class_name: "as",
				date: "2022-12-12 12:00:00",
			},
			{
				auth: credentials,
			}
		);

		expect(response.statusCode).toBe(400);
	});

	it("returns error message when short class name posted", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await postClass(
			{
				class_name: "as",
				date: "2022-12-12 12:00:00",
			},
			{
				auth: credentials,
			}
		);

		expect(response.body.message).toBe(
			"class name length can be between 3-30 characters"
		);
	});

	it("returns error message when long class name posted", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await postClass(
			{
				class_name: "this-text-is-longer-than-30-characters",
				date: "2022-12-12 12:00:00",
			},
			{
				auth: credentials,
			}
		);

		expect(response.body.message).toBe(
			"class name length can be between 3-30 characters"
		);
	});
});
