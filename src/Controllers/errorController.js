module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "fail";

	res.status(err.statusCode).send({
		status: err.status,
		message: err.message,
	});
};
