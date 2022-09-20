"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("users", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			firstname: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: "firstname cannot be null",
					},
				},
			},
			lastname: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: "lastname cannot be null",
					},
				},
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: {
					arg: true,
					msg: "email is already taken",
				},
				validate: {
					notNull: {
						msg: "email cannot be null",
					},
					isEmail: {
						msg: "must be a valid email",
					},
				},
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: "password cannot be null",
					},
				},
			},
			inactive: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			activationToken: {
				type: Sequelize.STRING,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("users");
	},
};
