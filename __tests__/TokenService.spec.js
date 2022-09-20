const sequelize = require("../src/config/db");
const Token = require("../src/Models/TokenModel");
const { scheduleCleanup } = require("../src/utils/tokenService");

beforeAll(async () => {
	await sequelize.sync();
});

beforeEach(async () => {
	await Token.destroy({ truncate: true });
});

describe("Scheduled Token Cleanup", () => {
	it("clears the expired token with schedule task", async () => {
		jest.useFakeTimers();
		const token = "test-token";
		const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

		await Token.create({ token: token, lastUsedAt: eightDaysAgo });

		scheduleCleanup();

		jest.advanceTimersByTime(60 * 60 * 1000 + 5000);
		const tokenInDB = await Token.findOne({ where: { token: token } });

		expect(tokenInDB).toBeNull();
	});
});
