const jwt = require("jsonwebtoken");
const {ACCESS_TOKEN_SECRET} = require("../config");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../prisma");

const verifyJWT = asyncHandler(async (req, res, next) => {
	const token = req.headers.authorization?.replace("Bearer ", "");

	if (!token) throw new ApiError(401, "Unauthorized request");

	try {
		const decodedToken = await new Promise((resolve, reject) => {
			jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
				if (err) reject(err);
				resolve(decoded);
			});
		});

		const user = await prisma.user.findUnique({where: {id: decodedToken?.id}});

		if (!user) throw new ApiError(401, "Unauthorized request");

		req.user = user;
		return next();
	} catch (error) {
		throw new ApiError(401, "Unauthorized request");
	}
});

const verifyRoles = (roles = []) => {
	return (req, res, next) => {
		if (!req.user) throw new ApiError(401, "Unauthorized request");
		if (!roles.includes(req.user?.role)) throw new ApiError(403, "You are not allowed to perform this action");

		return next();
	};
};

const verifyActive = (req, res, next) => {
	if (!req.user) throw new ApiError(401, "Unauthorized request");
	if (!req.user?.isActive) return res.status(403).json({error: "Your account is not active"});

	return next();
};

module.exports = {
	verifyJWT,
	verifyRoles,
	verifyActive,
};
