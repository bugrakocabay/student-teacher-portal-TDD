const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
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

const putUser = async (id = 5, body = null, options = {}) => {
	let agent = request(app);
	let token;
	if (options.auth) {
		const response = await agent.post("/users/login").send(options.auth);
		token = response.body.token;
	}

	agent = request(app).put("/users/" + id);

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

	it("returns 200 OK when user update is successful", async () => {
		const savedUser = await addUser();
		const update = { firstname: "cemsit" };

		const response = await putUser(savedUser.id, update, {
			auth: { email: savedUser.email, password: "verystr0ngpass" },
		});
		expect(response.statusCode).toBe(200);
	});

	it("updates firstname in database with valid authorization", async () => {
		const savedUser = await addUser();
		const update = { firstname: "cemsit" };
		await putUser(savedUser.id, update, {
			auth: { email: savedUser.email, password: "verystr0ngpass" },
		});

		const dbUser = await User.findOne({ where: { id: savedUser.id } });
		expect(dbUser.firstname).toBe(update.firstname);
	});

	it("returns 403 when token is not valid", async () => {
		const response = await putUser(5, null, { token: "123" });
		expect(response.statusCode).toBe(403);
	});
});
