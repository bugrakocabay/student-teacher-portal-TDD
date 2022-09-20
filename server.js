const app = require("./src/app");
const { scheduleCleanup } = require("./src/utils/tokenService");

scheduleCleanup();

app.listen(3000, () => {
	console.log("APP HAS STARTED AT localhost:3000");
});
