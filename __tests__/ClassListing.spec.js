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

const getClasses = async (options = {}) => {
	let agent = request(app);
	let token;
	if (options.auth) {
		const response = await agent
			.post(`/api/v1/users/login/`)
			.send(options.auth);
		token = response.body.token;
	}
	if (options.query) {
		agent = request(app).get(`/api/v1/classes?${options.query}`);
	} else {
		agent = request(app).get(`/api/v1/classes/`);
	}
	if (token) {
		agent.set("Cookie", [`token=${token}`]);
	}
	if (options.token) {
		agent.set("Cookie", [`token=${options.token}`]);
	}

	return agent;
};

const getSingleClass = async (id = 5, options = {}) => {
	let agent = request(app);
	let token;
	if (options.auth) {
		const response = await agent
			.post(`/api/v1/users/login/`)
			.send(options.auth);
		token = response.body.token;
	}
	agent = request(app).get(`/api/v1/classes/${id}`).send();

	if (token) {
		agent.set("Cookie", [`token=${token}`]);
	}

	return agent;
};

const createClass = async (count) => {
	for (let i = 0; i < count; i++) {
		const user = await User.create({
			firstname: `firstname${i + 1}`,
			lastname: `lastname${i + 1}`,
			email: `firstname${i + 1}@mail.com`,
			password: "P4ssword",
		});

		await Class.create({
			class_name: `class${i + 1}`,
			date: "1997-08-28 00:15:00",
			teacher: "bugra kocabay",
			userId: user.id,
		});
	}
};

describe("Listing Classes", () => {
	it("returns 401 when user is not authenticated", async () => {
		const response = await getClasses();

		expect(response.statusCode).toBe(401);
	});

	it("returns error message when user is not authenticated", async () => {
		const response = await getClasses();

		expect(response.body.message).toBe("Unauthorized");
	});

	it("returns 200 ok when there are no classes in database", async () => {
		await addUser();
		const response = await getClasses({ auth: credentials });

		expect(response.statusCode).toBe(200);
	});

	it("returns id, name, date, teacher,status in response body", async () => {
		await createClass(11);
		await addUser();
		const response = await getClasses({ auth: credentials });
		const classSample = response.body.content[0];

		expect(Object.keys(classSample)).toEqual([
			"id",
			"class_name",
			"date",
			"teacher",
			"status",
			"description",
		]);
	});

	it("returns page object as response body if user is authenticated", async () => {
		await addUser();
		const response = await getClasses({ auth: credentials });

		expect(response.body).toEqual({
			content: [],
			// page: 0,
			// size: 10,
			// totalPages: 0,
		});
	});
	/*
	it("returns 10 classes in page content when there are 11 classes in database", async () => {
		await createClass(11);
		await addUser();
		const response = await getClasses({ auth: credentials });

		expect(response.body.content.length).toBe(10);
	});

	it("returns 2 total pages when there are 11 classes in database", async () => {
		await createClass(11);
		await addUser();
		const response = await getClasses({ auth: credentials });

		expect(response.body.totalPages).toBe(2);
	});

	it("returns second page classes and page indicator when pages set as 1 in request parameter", async () => {
		await createClass(11);
		await addUser();
		const response = await getClasses({ auth: credentials, query: "page=1" });

		expect(response.body.content[0].class_name).toBe("class11");
		expect(response.body.page).toBe(1);
	});

	it("returns first page when page is set below zero as request parameter", async () => {
		await createClass(11);
		await addUser();
		const response = await getClasses({ auth: credentials, query: "page=-5" });

		expect(response.body.page).toBe(0);
	});*/
});

describe("Get single class", () => {
	it("returns 401 when user is not authenticated", async () => {
		const response = await getSingleClass();

		expect(response.statusCode).toBe(401);
	});

	it("returns 404 when class does not exist", async () => {
		await addUser();
		const response = await getSingleClass(5, { auth: credentials });

		expect(response.statusCode).toBe(404);
	});

	it("returns error message when class does not exist", async () => {
		await addUser();
		const response = await getSingleClass(5, { auth: credentials });

		expect(response.body.message).toBe("Can't find this class");
	});

	it("returns 200 when request made with valid credentials", async () => {
		await addUser();
		const newClass = await Class.create({
			class_name: "computer science",
			date: "2022-12-12 12:00:00",
		});
		const response = await getSingleClass(newClass.id, { auth: credentials });

		expect(response.statusCode).toBe(200);
	});

	it("returns id, name, date, teacher,status in response body", async () => {
		await addUser();
		const newClass = await Class.create({
			class_name: "computer science",
			date: "2022-12-12 12:00:00",
		});

		const response = await getSingleClass(newClass.id, { auth: credentials });

		expect(Object.keys(response.body)).toEqual([
			"id",
			"class_name",
			"date",
			"teacher",
			"status",
			"description",
		]);
	});
});
