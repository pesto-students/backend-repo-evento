const {REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY} = require("../config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {ApiResponse} = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const prisma = require("../prisma");

const signup = asyncHandler(async (req, res) => {
	const {name, email, password, role} = req.body;

	const existedUser = await prisma.user.findUnique({where: {email}});

	const hashedPassword = await bcrypt.hash(password, 10);

	if (existedUser) throw new ApiError(400, "User with email already exists");

	const user = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			role,
		},
	});

	delete user.password;

	return res.status(200).json(new ApiResponse(201, user));
});

const login = asyncHandler(async (req, res) => {
	const {email, password} = req.body;

	const {user, accessToken, refreshToken} = await authenticate(email, password);

	// res.cookie("accessToken", accessToken, {httpOnly: true, sameSite: "strict", secure: true});
	// res.cookie("refreshToken", refreshToken, {httpOnly: true, sameSite: "strict", secure: true});

	return res.status(200).json(new ApiResponse(200, {user, accessToken, refreshToken}, "Logged in successfully."));
});

const refresh = asyncHandler(async (req, res) => {
	const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

	if (!refreshToken) throw new ApiError(401, "Access Denied. No refresh token provided");

	const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
	const user = await prisma.user.findUnique({where: {id: decodedToken?.id}});
	const accessToken = generateAccessToken(user);
	const newRrefreshToken = generateRefreshToken(user);

	// res.cookie("accessToken", accessToken, {httpOnly: true, sameSite: "strict", secure: true});
	// res.cookie("refreshToken", newRrefreshToken, {httpOnly: true, sameSite: "strict", secure: true});

	return res.status(200).json(new ApiResponse(200, {accessToken, refreshToken: newRrefreshToken}, "Token refreshed."));
});

const logout = (req, res) => {
	// res.clearCookie("refreshToken", {httpOnly: true, sameSite: "strict", secure: true});
	// res.clearCookie("accessToken", {httpOnly: true, sameSite: "strict", secure: true});

	return res.status(200).json(new ApiResponse(200, {}, "Logged out."));
};

const getUserInfo = asyncHandler(async (req, res) => {
	const user = req.user;

	if (!user) throw new ApiError(404, "User not found!");

	delete user.password;

	return res.status(200).json(new ApiResponse(200, user));
});

const authenticate = async (email, password) => {
	try {
		const user = await prisma.user.findUnique({where: {email}});

		if (!user) {
			throw new Error("user Not found.");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new Error("Invalid credentials.");
		}

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		delete user.password;

		return {accessToken, refreshToken, user};
	} catch (error) {
		throw error;
	}
};

const generateAccessToken = ({id, name, email, role}) => {
	return jwt.sign({id, name, email, role}, ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRY});
};

const generateRefreshToken = ({id}) => {
	return jwt.sign({id}, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRY});
};

module.exports = {
	signup,
	login,
	refresh,
	logout,
	getUserInfo,
};
