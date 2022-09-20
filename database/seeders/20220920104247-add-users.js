"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
	// THIS CREATES 25 DUMMY USERS
	async up(queryInterface, Sequelize) {
		const hash = await bcrypt.hash("p4ssword", 10);
		const users = [];

		for (let i = 0; i < 25; i++) {
			users.push({
				firstname: `user${i + 1}`,
				lastname: `lastname${i + 1}`,
				email: `email${i + 1}@mail.com`,
				password: hash,
				inactive: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		await queryInterface.bulkInsert("users", users, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete("users", null, {});
	},
};
