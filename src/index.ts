import "dotenv/config";
import { Bot } from "./structures/client"

export const client = new Bot({
	intents: [1, 512],
});

client.start();
