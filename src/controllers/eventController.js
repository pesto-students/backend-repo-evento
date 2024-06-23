const {ApiResponse} = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../prisma");
const uploadOnCloudinary = require("../utils/cloudinary");
const {STRIPE_SUCCESS_URL, STRIPE_SECRET_KEY, STRIPE_CANCEL_URL} = require("../config");
const {UserRoles, EventStatus} = require("../utils/constants");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const getSingleEvent = asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id);
	const event = await prisma.event.findUnique({where: {id}});

	if (!event) throw new ApiError(404, "Event not found!");

	return res.status(200).json(new ApiResponse(200, event));
});

const getAllEvents = asyncHandler(async (req, res) => {
	if (req.user.role === UserRoles.MANAGER) {
		const page = req.query.page ? parseInt(req.query.page) : 1;
		const pageSize = req.query.limit ? parseInt(req.query.limit) : 100;
		const skip = (page - 1) * pageSize;

		const events = await prisma.event.findMany({
			skip,
			take: pageSize,
			where: {
				userId: req.user.id,
			},
		});

		const total = await prisma.event.count();

		return res.status(200).json(new ApiResponse(200, {events, page, pageSize, total}));
	}
	// else for USER & ADMIN
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

const createEvent = asyncHandler(async (req, res) => {
	const data = {
		...req.body,
		userId: req.user?.id,
		status: EventStatus.PAYMENT_PENDING,
		entryFee: Number(req.body.entryFee),
		categories: {
			create: req.body.categories?.map((categoryId) => {
				return {
					category: {
						connect: {
							id: categoryId,
						},
					},
				};
			}),
		},
	};

	const event = await prisma.event.create({
		data,
	});

	return res.status(200).json(new ApiResponse(200, {event}, "Event created successfully"));
});

const createCheckoutSession = asyncHandler(async (req, res) => {
	// find event using the req.body.eventId & check it is not paid

	const price = 499;
	const event = {
		id: 1,
		title: "AR Rahman Concert",
		thumbnailUrl: "https://res.cloudinary.com/dv68nyejy/image/upload/v1712380759/Evento/thumbnail/b_praak2_opndqq.webp",
	};

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: "inr",
					unit_amount: Math.round(price * 100),
					product_data: {
						name: event?.title,
						description: "BASIC Plan",
						images: [event?.thumbnailUrl], // This should be a live url
					},
				},
				quantity: 1,
			},
		],
		mode: "payment",
		payment_method_types: ["card"],
		success_url: STRIPE_SUCCESS_URL,
		cancel_url: STRIPE_CANCEL_URL,
		customer_email: req.user?.email,
		customer_name: req.user?.name,
		client_reference_id: event?.id,
		metadata: {
			customer_name: req.user?.name,
			customer_email: req.user?.email,
		},
		customer: {
			name: req.user?.name,
			email: req.user?.email,
		},
		billing_address_collection: "required",
	});

	res.status(200).json({
		status: "success",
		session,
	});
});

module.exports = {
	getSingleEvent,
	getAllEvents,
	uploadEventBanner,
	uploadEventThumbnail,
	createEvent,
	createCheckoutSession,
};
