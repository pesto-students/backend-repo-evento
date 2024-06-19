require("dotenv").config();
const config = require("./config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const globalErrorHandler = require("./utils/errorHandler");
const {createServer} = require("http");
const {Server} = require("socket.io");
const {initializeSocketIO} = require("./socket");
const logger = require("./logger");

const PORT = config.SERVER.PORT;
const app = express();
const httpServer = createServer(app);

const whitelist = config.WHITELIST ? config.WHITELIST.split(",") : [];

const corsOptions = {
	origin: (origin, callback) => {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS!"));
		}
	},
	credentials: true,
};

const io = new Server(httpServer, {
	pingTimeout: 60000,
	cors: corsOptions,
});

app.set("io", io);
app.enable("trust proxy");
app.use(cors(corsOptions));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

// Routes
const authRouter = require("./routes/authRoutes");
const eventRouter = require("./routes/eventRoutes");

app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/events`, eventRouter);

app.get("/", (req, res) => {
	res.status(200).json({message: "Welcome to evento API"});
});

app.all("*", (req, res) => {
	res.status(404).json({error: `Can't find ${req.originalUrl}`});
});

initializeSocketIO(io);

app.use(globalErrorHandler);

httpServer.listen(PORT, async () => {
	try {
		console.log(`Server running on port: ${PORT}`);
	} catch (error) {
		console.log(error);
	}
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	logger.error(error);
	process.exit(1);
});
