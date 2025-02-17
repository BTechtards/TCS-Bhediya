import { WebhookClient, EmbedBuilder } from "discord.js";
import { logger } from "./logger";

export function sendHook(
	webhook: string,
	title: string,
	desc: string,
	footertxt: string,
	footericon: string,
) {
	const hook = new WebhookClient({ url: webhook });
	const embed = new EmbedBuilder()
		.setTitle(title)
		.setDescription(desc)
		.setFooter({ text: footertxt, iconURL: footericon })
		.setTimestamp()
		.setColor("Blue");

	hook.send({
		embeds: [embed],
		username: "TCS Ninja",
		avatarURL: "https://media.discordapp.net/attachments/1340728855899537521/1340738282337865773/136064936_1534520460081517_4143995848815224906_n.png?ex=67b37354&is=67b221d4&hm=5467c486b40c50ff1435d3828b71219921e05a69cb7fdb51b7f35ab963932bf2&=&format=png&quality=lossless&width=594&height=594",
	});
}

export async function getRedditStats() {
	try {
		const response = await fetch('https://old.reddit.com/r/btechtards/about.json', {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
					'AppleWebKit/537.36 (KHTML, like Gecko) ' +
					'Chrome/90.0.4430.93 Safari/537.36',
			}

		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data.data.subscribers;
	} catch (err) {
		logger.error('Error fetching subreddit users:', err);
		throw err;
	}
}
