const {ApiResponse} = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../prisma");
const uploadOnCloudinary = require("../utils/cloudinary");

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

const uploadEventBanner = asyncHandler(async (req, res) => {
	const fileLocalPath = req.file?.path;

	if (!fileLocalPath) {
		throw new ApiError(400, "File is missing");
	}

	const banner = await uploadOnCloudinary(fileLocalPath, "evento/banners");

	if (!banner?.url) {
		throw new ApiError(400, "Error while uploading on avatar");
	}

	return res.status(200).json(new ApiResponse(200, {url: banner?.url}, "Avatar image updated successfully"));
});

const uploadEventThumbnail = asyncHandler(async (req, res) => {
	const fileLocalPath = req.file?.path;

	if (!fileLocalPath) {
		throw new ApiError(400, "File is missing");
	}

	const thumbnail = await uploadOnCloudinary(fileLocalPath, "evento/thumbnails");

	if (!thumbnail?.url) {
		throw new ApiError(400, "Error while uploading on avatar");
	}

	return res.status(200).json(new ApiResponse(200, {url: thumbnail?.url}, "Avatar image updated successfully"));
});

module.exports = {
	getSingleEvent,
	getAllEvents,
	uploadEventBanner,
	uploadEventThumbnail,
};
