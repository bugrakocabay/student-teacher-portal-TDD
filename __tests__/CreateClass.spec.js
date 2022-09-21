const request = require("supertest");
const app = require("../src/app");

const postClass = (body) => {
	return request(app).post("/classes/create-class").send(body);
};

describe("Create Class", () => {
	it("returns 401 when post class has no authentication", async () => {
		const response = await postClass();

		expect(response.statusCode).toBe(401);
	});
});
