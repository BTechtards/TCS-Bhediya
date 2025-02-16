import { Event } from "../structures/event";
import { client } from "../index";
import log from "../utils/logger";
import { ActivityType } from "discord.js";

export default new Event("ready", () => {
	log.warn(`Logged in as ${client.user.tag}.`);
	setInterval(async () => {
		const textList = [
			"you",
			`${client.users.cache.size} btechtards`,
			"mommy asmr",
		];
		const text = textList[Math.floor(Math.random() * textList.length)];
		client.user.setActivity(text, { type: ActivityType.Watching });
	}, 30000); // milliseconds
});
