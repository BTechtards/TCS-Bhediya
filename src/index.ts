import * as dotenv from "dotenv";
import { Bot } from "./structures/client"

dotenv.config();

export const client = new Bot({
	intents: [1, 512],
});

client.start();
