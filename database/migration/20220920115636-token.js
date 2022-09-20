"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("tokens", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			token: {
				type: Sequelize.STRING,
			},
			lastUsedAt: {
				type: Sequelize.DATE,
			},
			userId: {
				type: Sequelize.INTEGER,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "cascade",
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("tokens");
	},
};
