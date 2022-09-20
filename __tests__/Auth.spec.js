const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const Token = require("../src/Models/TokenModel");
const sequelize = require("../src/config/db");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
	await sequelize.sync();
});

beforeEach(async () => {
	await User.destroy({ truncate: { cascade: true } });
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

const postLogout = (options = {}) => {
	const agent = request(app).post("/users/logout");
	if (options.token) {
		agent.set("Authorization", options.token);
	}

	return agent.send();
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

	it("returns only user id,firstname,lastname and token when login success", async () => {
		const user = await addUser();
		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});

		expect(response.body.id).toBe(user.id);
		expect(response.body.firstname).toBe(user.firstname);
		expect(response.body.lastname).toBe(user.lastname);
		expect(Object.keys(response.body)).toEqual([
			"id",
			"firstname",
			"lastname",
			"token",
		]);
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

	it("returns token in response body when credentials are correct", async () => {
		await addUser();

		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});

		expect(response.body.token).not.toBeUndefined();
	});
});

describe("Logout", () => {
	it("returns 200 OK when unauthorized request sent for logout", async () => {
		const response = await postLogout();

		expect(response.statusCode).toBe(200);
	});

	it("deletes the token from the database", async () => {
		await addUser();

		const response = await postAuthentication({
			email: "araba@mail.com",
			password: "verystr0ngpass",
		});

		const token = response.body.token;
		await postLogout({ token: token });

		const storedToken = await Token.findOne({ where: { token: token } });
		expect(storedToken).toBeNull();
	});
});

describe("Token Expiration", () => {
	const putUser = async (id = 5, body = null, options = {}) => {
		let agent = request(app);

		agent = request(app).put("/users/" + id);
		if (options.token) {
			agent.set("Authorization", options.token);
		}
		return agent.send(body);
	};

	it("returns 403 when token is older than 1 week", async () => {
		const savedUser = await addUser();

		const token = "test-token";
		const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1);
		await Token.create({
			token: token,
			userId: savedUser.id,
			lastUsedAt: oneWeekAgo,
		});
		const validUpdate = { firstname: "user1-updated" };
		const response = await putUser(savedUser.id, validUpdate, { token: token });
		expect(response.status).toBe(403);
	});
});
