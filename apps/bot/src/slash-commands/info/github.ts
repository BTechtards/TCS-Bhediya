// ! Temporary until someone verifies/fixes aryan's code
// @ts-nocheck

import * as fs from 'node:fs';
import type { SlashCommand } from '@/types/command';
import { logger } from '@/utils/logger';
import { SlashCommandBuilder } from 'discord.js';

function toCamelCase(text: string): string {
    return text
        .split(' ')
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
}

function getLinkedUsername(discordId: string): string | null {
    try {
        const data = fs.readFileSync('./github-links.json', 'utf-8');
        const links = JSON.parse(data);
        return links[discordId] || null;
    } catch (err) {
        logger.error(`Error reading file: ${err}`);
        return null;
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setName('github')
        .setDescription('Get your linked GitHub profile stats.'),
    chatCommandHandler: async (interaction) => {
        const discordId = interaction.user.id;
        const username = getLinkedUsername(discordId);

        if (!username) {
            await interaction.reply({
                content:
                    "You haven't linked your GitHub account yet. Please link your account first.",
            });
            return;
        }

        try {
            // Acknowledge the interaction early
            await interaction.deferReply();

            const userInfoRes = await fetch(
                `https://api.github.com/users/${username}`,
            );
            const userReposRes = await fetch(
                `https://api.github.com/users/${username}/repos?per_page=100`,
            );

            if (!userInfoRes.ok || !userReposRes.ok) {
                throw new Error('GitHub API request failed');
            }

            const userInfo = await userInfoRes.json();
            const userRepos = await userReposRes.json();

            if (userInfo && userRepos) {
                const reposCount = userRepos.length;
                const followersCount = userInfo.followers;
                const followingCount = userInfo.following;
                const publicReposCount = userInfo.public_repos;
                const bio = userInfo.bio || 'No bio available';

                const embed = {
                    title: `${userInfo.name || userInfo.login} (${username})`,
                    description: `GitHub Profile for ${username}`,
                    fields: [
                        {
                            name: 'Followers',
                            value: `${followersCount}`,
                            inline: true,
                        },
                        {
                            name: 'Following',
                            value: `${followingCount}`,
                            inline: true,
                        },
                        {
                            name: 'Public Repositories',
                            value: `${publicReposCount}`,
                            inline: true,
                        },
                        {
                            name: 'Repositories',
                            value: `${reposCount}`,
                            inline: true,
                        },
                        { name: 'Bio', value: bio, inline: false },
                    ],
                    color: 0x6e5494,
                    thumbnail: { url: userInfo.avatar_url }, // Avatar
                };
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({
                    content:
                        'An error occurred while fetching data. Please try again later.',
                    ephemeral: true,
                });
            }
        } catch (err) {
            logger.error(`Error fetching GitHub profile: ${err}`);
            await interaction.editReply({
                content:
                    'An error occurred while fetching your profile. Please try again later.',
                ephemeral: true,
            });
        }
    },
} satisfies SlashCommand;
