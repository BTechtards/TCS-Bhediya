import { ActivityType } from "discord.js";
import { Event } from "@/structures/event";
import { logger } from "@/utils/logger";
import { getRedditStats } from "@/utils/functions";

export default new Event("ready", (d) => async (client) => {
	logger.info(`Logged in as ${client.user?.tag}`);

	let memberCount = 0;
	let redditCount = 0;

	try {
		const uc = await getRedditStats();
		redditCount += uc;
	} catch (err) {
		logger.error(`Error: ${err}`);
	}


	client.guilds.cache.forEach(guild => {
		memberCount += guild.memberCount;
	});

	setInterval(async () => {
		const textList = [
			`${memberCount} discord members`,
			`${redditCount} btechtards on reddit`,
			"mommy asmr videos", // very important
		];
		const text = textList[Math.floor(Math.random() * textList.length)];
		client.user?.setActivity(text, { type: ActivityType.Watching });
	}, 30000); // milliseconds
});
