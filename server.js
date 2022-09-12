const app = require("./src/app");
const sequelize = require("./src/config/db");

sequelize.sync();

app.listen(3000, () => {
	console.log("App is running...");
});
