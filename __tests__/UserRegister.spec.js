const request = require("supertest");
const app = require("../src/app");
const User = require("../src/Models/UserModel");
const sequelize = require("../src/config/db");

beforeAll(() => {
	return sequelize.sync();
});

beforeEach(() => {
	return User.destroy({ truncate: true });
});

describe("User Registration", () => {
	it("returns 200 OK when signup is valid", (done) => {
		request(app)
			.post("/users/register")
			.send({
				firstname: "osman",
				lastname: "baba",
				email: "user1@mail.com",
				password: "P4ssword",
			})
			.then((response) => {
				expect(response.status).toBe(200);
				done();
			});
		//.expect(200, done);
	});

	it("returns success message when signup request is valid", (done) => {
		request(app)
			.post("/users/register")
			.send({
				firstname: "osman",
				lastname: "baba",
				email: "user1@mail.com",
				password: "P4ssword",
			})
			.then((response) => {
				expect(response.body.message).toBe("User created");
				done();
			});
		//.expect(200, done);
	});

	it("saves user to database", (done) => {
		request(app)
			.post("/users/register")
			.send({
				firstname: "osman",
				lastname: "baba",
				email: "user1@mail.com",
				password: "P4ssword",
			})
			.then(() => {
				// query user table
				User.findAll().then((userList) => {
					expect(userList.length).toBe(1);
					done();
				});
			});
		//.expect(200, done);
	});

	it("saves firstname, lastname and email to database", (done) => {
		request(app)
			.post("/users/register")
			.send({
				firstname: "osman",
				lastname: "baba",
				email: "user1@mail.com",
				password: "P4ssword",
			})
			.then(() => {
				// query user table
				User.findAll().then((userList) => {
					const savedUser = userList[0];
					expect(savedUser.firstname).toBe("osman");
					expect(savedUser.lastname).toBe("baba");
					expect(savedUser.email).toBe("user1@mail.com");
					done();
				});
			});
	});

	it("hashes the password in database", (done) => {
		request(app)
			.post("/users/register")
			.send({
				firstname: "osman",
				lastname: "baba",
				email: "user1@mail.com",
				password: "P4ssword",
			})
			.then(() => {
				// query user table
				User.findAll().then((userList) => {
					const savedUser = userList[0];
					expect(savedUser.password).not.toBe("P4ssword");
					done();
				});
			});
	});
});
