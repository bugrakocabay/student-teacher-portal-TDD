const { randomString } = require("../utils/generator");
const Token = require("../Models/TokenModel");
const Sequelize = require("sequelize");

const createToken = async (user) => {
	const token = randomString(32);
	await Token.create({ token: token, userId: user.id, lastUsedAt: new Date() });

	return token;
};

const verify = async (token) => {
	const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const tokenInDB = await Token.findOne({
		where: { token: token, lastUsedAt: { [Sequelize.Op.gt]: oneWeekAgo } },
	});
	const userId = tokenInDB.userId;

	return { id: userId };
};

const deleteToken = async (token) => {
	await Token.destroy({ where: { token: token } });
};

module.exports = {
	createToken,
	verify,
	deleteToken,
};