import { createLogger, format, transports } from "winston";
const colorizer = format.colorize();

export const logger = createLogger({
	format: format.combine(
		format.timestamp({ format: "YYYY-MM-DD HH:mm" }),
		format.simple(),
		format.printf((msg) =>
			colorizer.colorize(
				msg.level,
				`[${msg.timestamp}] [${msg.level}]: ${msg.message}`,
			)
		),
	),
	transports: [new transports.Console()],
});
