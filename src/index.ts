import "dotenv/config";
import { GatewayIntentBits } from "discord.js";
import { Bot } from "./structures/client"
import { readEnv } from './utils/readEnv';

const env = readEnv();
export const client = new Bot({ env }, {
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildMembers
	],
});

client.start();
