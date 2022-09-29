const Token = require("../Models/TokenModel");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");

const createToken = async (user) => {
	return jwt.sign({ id: user.id }, process.env.JWTSECRET);
};

const verify = async (token) => {
	return jwt.verify(token, process.env.JWTSECRET);
};

const deleteToken = async (token) => {
	await Token.destroy({ where: { token: token } });
};

const scheduleCleanup = () => {
	setInterval(async () => {
		const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		await Token.destroy({
			where: { lastUsedAt: { [Sequelize.Op.lt]: oneWeekAgo } },
		});
	}, 60 * 60 * 1000);
};

module.exports = {
	createToken,
	verify,
	deleteToken,
	scheduleCleanup,
};
