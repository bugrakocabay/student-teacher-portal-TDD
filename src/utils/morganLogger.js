const morgan = require("morgan");
const logger = require("../utils/logger");

const morganLogger = morgan(
	":status :method :url :remote-addr :response-time",
	{ stream: { write: (message) => logger.http(message.trim()) } }
);

module.exports = morganLogger;
