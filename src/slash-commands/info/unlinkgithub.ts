import fs from 'fs';
import { logger } from '@/utils/logger';
import { SlashCommandBuilder } from 'discord.js';

function unlinkGitHubUsername(discordId: string): boolean {
    try {
        const data = fs.readFileSync('./github-links.json', 'utf-8');
        const links = JSON.parse(data);

        if (!links[discordId]) return false;

        delete links[discordId];
        fs.writeFileSync('./github-links.json', JSON.stringify(links, null, 2));
        return true;
    } catch (err) {
        logger.error(`Error updating github-links.json: ${err}`);
        return false;
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setName('unlinkgithub')
        .setDescription(
            'Unlink your GitHub account from your Discord account.',
        ),
    chatCommandHandler: async (interaction) => {
        const discordId = interaction.user.id;

        if (unlinkGitHubUsername(discordId)) {
            await interaction.reply(
                'Your GitHub account has been unlinked successfully.',
            );
        } else {
            await interaction.reply('You don’t have a linked GitHub account.');
        }
    },
};
