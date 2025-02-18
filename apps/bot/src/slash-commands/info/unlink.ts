// ! Temporary until someone verifies/fixes aryan's code
// @ts-nocheck

import * as fs from 'node:fs';
import { logger } from '@/utils/logger';
import { SlashCommandBuilder } from 'discord.js';

function unlinkUsername(discordId) {
    try {
        const data = fs.readFileSync('./links.json', 'utf-8');
        const links = JSON.parse(data);

        if (!links[discordId]) return false;

        delete links[discordId];
        fs.writeFileSync('./links.json', JSON.stringify(links, null, 2));
        return true;
    } catch (err) {
        logger.error(`Error updating links.json: ${err}`);
        return false;
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription(
            'Unlink your Codeforces account from your Discord account.',
        ),
    chatCommandHandler: async (interaction) => {
        const discordId = interaction.user.id;

        if (unlinkUsername(discordId)) {
            await interaction.reply({
                content:
                    'Your Codeforces account has been unlinked successfully.',
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "You don't have a linked Codeforces account.",
                ephemeral: true,
            });
        }
    },
};
