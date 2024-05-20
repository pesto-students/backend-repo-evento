const {ACCESS_TOKEN_SECRET} = require("../config");
const jwt = require("jsonwebtoken");

const initializeSocketIO = (io) => {
	return io.on("connection", async (socket) => {
		console.log("New socket connection --->", socket.id);
		try {
			const token = socket.handshake.headers.token;

			if (token) {
				const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
				const user = await userService.getUserById(decoded?.id);
				if (!user) socket.emit("error", "Un-authorized handshake. Token is invalid");
				socket.user = user;
				socket.join(user.id.toString());
				console.log("User connected -> userId:", user.id);
			}

			socket.on("joinRoom", (room) => {
				socket.join(room);
				socket.emit("joinedRoom", `You have joined room: ${room}`);
				console.log(`${socket.id} joined room: ${room}`);
			});

			socket.on("disconnect", () => {
				if (socket.user) {
					socket.leave(socket.user?.id);
					console.log("User disconnected -> userId:", socket.user?.id);
				}
			});
		} catch (error) {
			console.error("Socket initialization error:", error.message);
		}
	});
};

const emitSocketEvent = (req, room, event, payload) => {
	try {
		req.app.get("io").in(room).emit(event, payload);
	} catch (error) {
		console.error("Socket event emitting error:", error.message);
	}
};

module.exports = {initializeSocketIO, emitSocketEvent};
