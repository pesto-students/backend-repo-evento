const validationErrorsFormatter = (validationError) => {
	const errors = [];

	validationError.details.forEach((err) => {
		const key = err.path.join("");
		const message = err.message;

		errors.push({[key]: message});
	});

	return errors;
};

module.exports = validationErrorsFormatter;
