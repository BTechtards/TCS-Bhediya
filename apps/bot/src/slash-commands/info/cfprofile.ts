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

function countSolvedProblems(submissions: any[]): number {
    const alreadySolved = new Set<string>();
    for (const submission of submissions) {
        if (submission.verdict === 'OK') {
            alreadySolved.add(
                `${submission.problem.contestId}-${submission.problem.index}`,
            );
        }
    }
    return alreadySolved.size;
}

function getLinkedUsername(discordId: string): string | null {
    try {
        const data = fs.readFileSync('./links.json', 'utf-8');
        const links = JSON.parse(data);
        return links[discordId] || null;
    } catch (err) {
        logger.error(`Error reading file: ${err}`);
        return null;
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setName('codeforces')
        .setDescription('Get your linked Codeforces profile stats.'),
    chatCommandHandler: async (interaction) => {
        const discordId = interaction.user.id;
        const username = getLinkedUsername(discordId);

        if (!username) {
            await interaction.reply({
                content:
                    "You haven't linked your Codeforces account yet. Please link your account first.",
                ephemeral: true,
            });
            return;
        }

        try {
            const [userInfoRes, userStatusRes, userRatingRes] =
                await Promise.all([
                    fetch(
                        `https://codeforces.com/api/user.info?handles=${username}`,
                    ).then((res) => res.json()),
                    fetch(
                        `https://codeforces.com/api/user.status?handle=${username}`,
                    ).then((res) => res.json()),
                    fetch(
                        `https://codeforces.com/api/user.rating?handle=${username}`,
                    ).then((res) => res.json()),
                ]);

            if (
                userInfoRes.status === 'OK' &&
                userStatusRes.status === 'OK' &&
                userRatingRes.status === 'OK'
            ) {
                const user = userInfoRes.result[0];
                const problemsSolved = countSolvedProblems(
                    userStatusRes.result,
                );
                const contestsParticipated = userRatingRes.result.length;
                const formattedRank = user.rank
                    ? toCamelCase(user.rank)
                    : 'N/A';

                const embed = {
                    title: `${user.firstName || ''} ${user.lastName || ''} (${username})`,
                    description: `Codeforces Profile for ${username}`,
                    fields: [
                        {
                            name: 'Member Since',
                            value: new Date(
                                user.registrationTimeSeconds * 1000,
                            ).toLocaleDateString(),
                            inline: true,
                        },
                        {
                            name: 'Current Ranking',
                            value: formattedRank,
                            inline: true,
                        },
                        {
                            name: 'Highest Rating',
                            value: `${user.maxRating}`,
                            inline: true,
                        },
                        {
                            name: 'Current Rating',
                            value: `${user.rating}`,
                            inline: true,
                        },
                        {
                            name: 'Problems Solved',
                            value: `${problemsSolved}`,
                            inline: true,
                        },
                        {
                            name: 'Contests Participated',
                            value: `${contestsParticipated}`,
                            inline: true,
                        },
                    ],
                    color: 0x88c0d0,
                    thumbnail: { url: `${user.titlePhoto}` }, // Small avatar
                };
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply({
                    content:
                        'An error occurred while fetching data. Please try again later.',
                    ephemeral: true,
                });
            }
        } catch (err) {
            logger.error(`Error fetching Codeforces profile: ${err}`);
            await interaction.reply({
                content:
                    'An error occurred while fetching your profile. Please try again later.',
                ephemeral: true,
            });
        }
    },
} satisfies SlashCommand;
