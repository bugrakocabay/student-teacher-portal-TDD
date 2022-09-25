const request = require("supertest");
const app = require("../src/app");
const Class = require("../src/Models/ClassModel");
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
	await Class.destroy({ truncate: { cascade: true } });
});

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
	teacher: "osman peri",
};

const addClass = async (body = classBody) => {
	return await Class.create(body);
};

const updateClassBody = {
	class_name: "computerscience50",
	date: "1990-08-08 00:15:00",
	status: "finished",
};

const updateClass = async (id = 5, body = updateClassBody, options = {}) => {
	let agent = request(app);
	let token;
	if (options.auth) {
		const response = await agent.post(`/users/login/`).send(options.auth);
		token = response.body.token;
	}

	agent = request(app)
		.put("/classes/" + id)
		.send(body);

	if (token) {
		agent.set("Authorization", token);
	}
	if (options.token) {
		agent.set("Authorization", options.token);
	}

	return agent;
};

describe("Update Class", () => {
	it("returns 401 when user has no authentication", async () => {
		const response = await updateClass();

		expect(response.statusCode).toBe(401);
	});

	it("returns error message when user has no authentication", async () => {
		const response = await updateClass();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns 403 when user is a student", async () => {
		await addUser();
		const newClass = await addClass();
		const response = await updateClass(newClass.id, updateClassBody, {
			auth: credentials,
		});

		expect(response.statusCode).toBe(403);
	});

	it("returns 403 when a teacher tries to update another teachers class", async () => {
		let otherTeacher = await addUser({
			firstname: "osman",
			lastname: "ahmet",
			email: "televizyon@mail.com",
			inactive: false,
			password: "verystr0ngpass",
			role: "teacher",
		});
		let newClass = await addClass({ ...classBody, userId: otherTeacher.id });

		await addUser({ ...activeUser, role: "teacher" });
		const respone = await updateClass(newClass.id, updateClassBody, {
			auth: credentials,
		});

		expect(respone.statusCode).toBe(403);
	});

	it("returns 404 when class does not exist", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await updateClass(5, updateClassBody, {
			auth: credentials,
		});

		expect(response.statusCode).toBe(404);
	});

	it("returns error message when class does not exist", async () => {
		await addUser({ ...activeUser, role: "teacher" });
		const response = await updateClass(5, updateClassBody, {
			auth: credentials,
		});

		expect(response.body.message).toBe("Can't find this class");
	});

	it("returns 200 OK when a valid request is sent by an authorized user", async () => {
		const teacher = await addUser({ ...activeUser, role: "teacher" });
		const newClass = await addClass({ ...classBody, userId: teacher.id });

		const response = await updateClass(newClass.id, updateClassBody, {
			auth: credentials,
		});

		expect(response.statusCode).toBe(200);
	});

	it("returns success message when a valid request is sent by an authorized user", async () => {
		const teacher = await addUser({ ...activeUser, role: "teacher" });
		const newClass = await addClass({ ...classBody, userId: teacher.id });

		const response = await updateClass(newClass.id, updateClassBody, {
			auth: credentials,
		});

		expect(response.body.message).toBe("Updated successfully");
	});
});
