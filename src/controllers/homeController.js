const {ApiResponse} = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../prisma");

const getHomeData = asyncHandler(async (req, res) => {
	const events = await prisma.event.findMany({
		take: 4,
	});

	return res.status(200).json(new ApiResponse(200, {events}));
});

module.exports = {
	getHomeData,
};
