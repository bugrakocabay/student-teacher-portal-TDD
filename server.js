const app = require("./src/app");
const sequelize = require("./src/config/db");

app.listen(3000, () => {
	console.log("App is running...");
});
