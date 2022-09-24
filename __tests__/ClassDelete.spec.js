const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const Class = require("../src/Models/ClassModel");
const sequelize = require("../src/config/db");
const bcrypt = require("bcryptjs");

if (process.env.NODE_ENV == "test") {
	beforeAll(async () => {
		await sequelize.sync();
	});
}

beforeEach(async () => {
	await User.destroy({ truncate: { cascade: true } });
});

const auth = async (options = {}) => {
	let token;
	if (options.auth) {
		const respone = await request(app).post("/users/login").send(options.auth);
		token = respone.body.token;
	}
	return token;
};

const deleteClass = async (id = 5, options = {}) => {
	let agent = request(app).delete("/classes/" + id);

	if (options.token) {
		agent.set("Authorization", options.token);
	}

	return agent.send();
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

const credentials = { email: "terlik@mail.com", password: "verystr0ngpass" };

const classBody = {
	class_name: "computer science",
	date: "2022-12-12 12:00:00",
};

const addClass = async (body = classBody) => {
	return await Class.create(body);
};

describe("Delete Class", () => {
	it("returns 403 when request it unauthorized", async () => {
		const response = await deleteClass();

		expect(response.statusCode).toBe(403);
	});

	it("returns 403 when token is invalid ", async () => {
		const response = await deleteClass(5, { token: "abcd" });

		expect(response.statusCode).toBe(403);
	});

	it("returns error message when request it unauthorized", async () => {
		const response = await deleteClass();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns 401 when a student sends the request", async () => {
		await addUser();
		let token = await auth({ auth: credentials });

		const respone = await deleteClass(5, { token: token });

		expect(respone.statusCode).toBe(401);
	});

	it("returns 200 when user is fully authenticated", async () => {
		await addUser({ ...activeUser, role: "teacher" });

		let token = await auth({ auth: credentials });

		const respone = await deleteClass(5, { token: token });
		expect(respone.statusCode).toBe(200);
	});

	it("deletes the class from database with valid request", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		let token = await auth({ auth: credentials });
		let newClass = await addClass();

		const respone = await deleteClass(newClass.id, { token: token });
		expect(respone.statusCode).toBe(200);
	});
});
