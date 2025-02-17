import { ActivityType } from "discord.js";
import { Event } from "@/structures/event";
import { logger } from "@/utils/logger";

export default new Event("ready", (d) => (client) => {
	logger.info(`Logged in as ${client.user?.tag}`);

	let memberCount = 0;
	client.guilds.cache.forEach(guild => {
		console.log(guild.memberCount);
		memberCount += guild.memberCount;
	});

	setInterval(async () => {
		const textList = [
			`${memberCount} btechtards`,
			"mommy asmr videos", // very important
		];
		const text = textList[Math.floor(Math.random() * textList.length)];
		client.user?.setActivity(text, { type: ActivityType.Watching });
	}, 30000); // milliseconds
});
