"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const colorizer = winston_1.format.colorize();
const log = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm" }), winston_1.format.simple(), winston_1.format.printf((msg) => colorizer.colorize(msg.level, `[${msg.timestamp}] [${msg.level}]: ${msg.message}`))),
    transports: [new winston_1.transports.Console()],
});
exports.default = log;
