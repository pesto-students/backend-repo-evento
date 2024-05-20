const {format, createLogger, transports} = require("winston");
const {combine, timestamp, printf, errors, prettyPrint} = format;
require("winston-daily-rotate-file");

const fileRotateTransport = new transports.DailyRotateFile({
	filename: "logs/error-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	maxFiles: "14d",
});

const logger = createLogger({
	level: "debug",
	format: combine(
		timestamp({
			format: "MMM-DD-YYYY HH:mm:ss",
		}),
		errors({stack: true}),
		prettyPrint(),
	),
	transports: [fileRotateTransport, new transports.Console()],
});

module.exports = logger;
