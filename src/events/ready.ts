import { Event } from '@/structures/event';
import { getRedditStats } from '@/utils/functions';
import { logger } from '@/utils/logger';
import { ActivityType } from 'discord.js';

function formatNumber(num: number): string {
    const formatted = (num / 1000).toFixed(1);
    return num >= 1000
        ? formatted.endsWith('.0')
            ? formatted.slice(0, -2) + 'k'
            : formatted + 'k'
        : num.toString();
}

export default new Event('ready', (d) => async (client) => {
    logger.info(`Logged in as ${client.user?.tag}`);

    let memberCount = 0;
    let redditCount = 0;

    try {
        const uc = await getRedditStats();
        redditCount += uc;
    } catch (err) {
        logger.error(`Error: ${err}`);
    }

    client.guilds.cache.forEach((guild) => {
        memberCount += guild.memberCount;
    });

    setInterval(async () => {
        const textList = [
            `${formatNumber(memberCount)} Members`,
            `${formatNumber(redditCount)} Subscribers`,
        ];
        const text = textList[Math.floor(Math.random() * textList.length)];
        client.user?.setActivity({
            name: text,
            type: ActivityType.Streaming,
            url: 'https://twitch.tv/btechtards', // Replace with an actual streaming URL
        });
    }, 30000); // milliseconds
});
