const {ApiResponse} = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../prisma");

const getSingleEvent = asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id);
	const event = await prisma.event.findUnique({where: {id}});

	if (!event) throw new ApiError(404, "Event not found!");

	return res.status(200).json(new ApiResponse(200, event));
});

const getAllEvents = asyncHandler(async (req, res) => {
	const page = req.query.page ? parseInt(req.query.page) : 1;
	const pageSize = req.query.limit ? parseInt(req.query.limit) : 100;
	const skip = (page - 1) * pageSize;

	const events = await prisma.event.findMany({
		skip,
		take: pageSize,
	});
	const total = await prisma.event.count();

	return res.status(200).json(new ApiResponse(200, {events, page, pageSize, total}));
});

module.exports = {
	getSingleEvent,
	getAllEvents,
};
