const ApiError = require("./ApiError");
const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
	let error = err;

	if (!(error instanceof ApiError)) {
		logger.error(error);
		const statusCode = error.statusCode || 500;
		const message = error.message || "Something went wrong";
		error = new ApiError(statusCode, message, error?.errors || [], err.stack);
	}

	const response = {
		...error,
		message: error.message,
		...(process.env.NODE_ENV === "development" ? {stack: error.stack} : {}),
	};
	return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
