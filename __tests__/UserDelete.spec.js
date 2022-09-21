const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const Token = require("../src/Models/TokenModel");
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

const deleteUser = async (id = 5, options = {}) => {
	let agent = request(app).delete("/users/" + id);

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

describe("User Delete", () => {
	it("returns 403 forbidden when sent without authorization", async () => {
		const response = await deleteUser();

		expect(response.statusCode).toBe(403);
	});

	it("returns error message when sent without authorization", async () => {
		const response = await deleteUser();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns forbidden when delete request is sent with correct credentials but for different user", async () => {
		await addUser();
		const userToDelete = await addUser({
			...activeUser,
			firstname: "user2",
			email: "user2@mail.com",
		});
		const token = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});

		const respone = await deleteUser(userToDelete.id, { token: token });
		expect(respone.statusCode).toBe(403);
	});

	it("returns 403 when token is not valid", async () => {
		const response = await deleteUser(5, { token: "123" });
		expect(response.statusCode).toBe(403);
	});

	it("returns 200 OK when delete request sent from authorized user", async () => {
		const savedUser = await addUser();
		const token = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});
		const response = await deleteUser(savedUser.id, { token: token });
		expect(response.statusCode).toBe(200);
	});

	it("deletes user from database when request sent from authorized user", async () => {
		const savedUser = await addUser();
		const token = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});
		await deleteUser(savedUser.id, { token: token });
		const dbUser = await User.findOne({ where: { id: savedUser.id } });

		expect(dbUser).toBeNull();
	});

	it("deletes token from database when delete request sent from authorized user", async () => {
		const savedUser = await addUser();
		const token = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});
		await deleteUser(savedUser.id, { token: token });
		const tokenDB = await Token.findOne({ where: { token: token } });

		expect(tokenDB).toBeNull();
	});

	it("deletes all token from database when delete request sent from authorized user", async () => {
		const savedUser = await addUser();
		const token = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});
		const token2 = await auth({
			auth: { email: "terlik@mail.com", password: "verystr0ngpass" },
		});

		await deleteUser(savedUser.id, { token: token });
		const token2DB = await Token.findOne({ where: { token: token2 } });

		expect(token2DB).toBeNull();
	});
});
