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

const putUser = async (id = 5, body = null, options = {}) => {
	const agent = request(app).put("/users/" + id);

	if (options.auth) {
		const { email, password } = options.auth;
		agent.auth(email, password);
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

describe("User Update", () => {
	it("returns 403 forbidden when sent without authorization", async () => {
		const response = await putUser();

		expect(response.statusCode).toBe(403);
	});

	it("returns error message when sent without authorization", async () => {
		const response = await putUser();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns forbidden when request sent with incorrect email in basic auth", async () => {
		await addUser();

		const response = await putUser(5, null, {
			auth: { email: "wrong@mail.com", password: "verystr0ngpass" },
		});
		expect(response.statusCode).toBe(403);
	});

	it("returns 200 OK when user update is successfull", async () => {
		const savedUser = await addUser();
		const update = { firstname: "cemsit" };

		const response = await putUser(savedUser.id, update, {
			auth: { email: savedUser.email, password: "verystr0ngpass" },
		});
		expect(response.statusCode).toBe(200);
	});
});
