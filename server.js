const app = require("./src/app");
const { scheduleCleanup } = require("./src/utils/tokenService");
const logger = require("./src/utils/logger");

scheduleCleanup();

app.listen(3000, () => {
	logger.info(
		`APP HAS STARTED AT localhost:3000 version ${process.env.npm_package_version}`
	);
});
