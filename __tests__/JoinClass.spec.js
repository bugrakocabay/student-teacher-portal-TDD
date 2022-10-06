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
	await Class.destroy({ truncate: { cascade: true } });
});

const auth = async (options = {}) => {
	let token;
	if (options.auth) {
		const respone = await request(app)
			.post("/api/v1/users/login")
			.send(options.auth);
		token = respone.body.token;
	}
	return token;
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

const joinClass = async (id = 5, options = {}) => {
	let agent = request(app).get(`/api/v1/classes/${id}/join`);

	if (options.token) {
		agent.set("Cookie", [`token=${options.token}`]);
	}

	return agent.send();
};

describe("Join Class", () => {
	it("returns 401 when request it unauthenticated", async () => {
		const response = await joinClass();

		expect(response.statusCode).toBe(401);
	});

	it("returns 401 when token is invalid ", async () => {
		const response = await joinClass(5, { token: "abcd" });

		expect(response.statusCode).toBe(401);
	});

	it("returns error message when request it unauthorized", async () => {
		const response = await joinClass();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns 401 when a teacher sends the request", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		let token = await auth({ auth: credentials });
		let myClass = await addClass();

		const response = await joinClass(myClass.id, { token: token });

		expect(response.statusCode).toBe(403);
	});

	it("returns error message when a teacher sends the request", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		let token = await auth({ auth: credentials });
		let myClass = await addClass();

		const response = await joinClass(myClass.id, { token: token });

		expect(response.body.message).toBe("Teachers can't join classes");
	});

	it("returns 200 when the request is valid", async () => {
		await addUser();
		let token = await auth({ auth: credentials });
		let myClass = await addClass();

		const response = await joinClass(myClass.id, { token: token });
		expect(response.statusCode).toBe(200);
	});
});
