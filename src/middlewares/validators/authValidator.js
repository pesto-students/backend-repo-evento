const Joi = require("joi");
const ApiError = require("../../utils/ApiError");
const validationErrorsFormatter = require("../../utils/validationErrorsFormatter");

const signupValidator = (req, res, next) => {
	const validRoles = ["USER", "MANAGER"];
	const signupSchema = Joi.object({
		email: Joi.string().email().required(),
		name: Joi.string().required(),
		password: Joi.string().required(),
		confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
			"any.only": "Passwords do not match",
		}),
		role: Joi.string()
			.valid(...validRoles)
			.required()
			.messages({
				"any.only": 'Role must be either "USER" or "MANAGER"',
			}),
	});

	const {error} = signupSchema.validate(req.body);

	if (error) throw new ApiError(422, "Received data is not valid", validationErrorsFormatter(error));

	return next();
};

const loginValidator = (req, res, next) => {
	const loginSchema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	});

	const {error} = loginSchema.validate(req.body);

	if (error) throw new ApiError(422, "Received data is not valid", validationErrorsFormatter(error));

	return next();
};

module.exports = {
	signupValidator,
	loginValidator,
};
