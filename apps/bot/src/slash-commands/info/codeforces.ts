import { and, eq } from 'drizzle-orm';
import { SlashCommandBuilder } from 'discord.js';
import { logger } from '@/utils/logger';
import { SlashCommand } from '@/types/command';
import { userIntegrations } from '@tcs-bhediya/db/schema'; // Ensure this is correct import
import fetch from 'node-fetch';
import * as fs from 'node:fs';

const pendingValidation: Map<
    string,
    { username: string; timestamp: number; problemId: string }
> = new Map();

const validateCodeforcesUsername = async (username: string) => {
    const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${username}`,
    );
    const data = await response.json();
    return data.status === 'OK' && data.result.length > 0 ? data.result[0] : null;
};

const getRandomProblem = async (): Promise<{
    problemId: string;
    problemLink: string;
} | null> => {
    const contestId = Math.floor(Math.random() * (2067 - 1 + 1)) + 1;
    const problemIndex = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    const problemId = `${contestId}${problemIndex}`;
    const problemLink = `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`;

    const response = await fetch(
        `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`,
    );
    const data = await response.json();

    if (data.status === 'OK') {
        return { problemId, problemLink };
    }

    return null;
};

const checkCompilationError = async (
    username: string,
    problemId: string,
    afterTimestamp: number,
): Promise<boolean> => {
    const response = await fetch(
        `https://codeforces.com/api/user.status?handle=${username}`,
    );
    const data = await response.json();

    if (data.status !== 'OK') return false;

    for (const submission of data.result) {
        if (
            submission.problem &&
            submission.problem.contestId &&
            submission.problem.index &&
            submission.creationTimeSeconds > afterTimestamp
        ) {
            const submissionProblemId = `${submission.problem.contestId}${submission.problem.index}`;
            if (
                submissionProblemId === problemId &&
                submission.verdict === 'COMPILATION_ERROR'
            ) {
                return true;
            }
        }
    }
    return false;
};

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

export default {
    builder: new SlashCommandBuilder()
        .setName('codeforces')
        .setDescription('Link, unlink, or get stats for your Codeforces account')
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Link your Codeforces account')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Your Codeforces username')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlink')
                .setDescription('Unlink your Codeforces account')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Get your Codeforces profile stats')
        ),

    chatCommandHandler: async (interaction, { client, db }) => {
        const discordId = interaction.user.id;
// 
        try {
            if (interaction.options.getSubcommand() === 'link') {
                const username = interaction.options.getString('username');
                logger.info(`Linking Codeforces account for user: ${discordId}, username: ${username}`);

                await interaction.deferReply();

                // Check if the account is already linked
                const rows = await db
                    .select()
                    .from(userIntegrations)
                    .where(
                        and(
                            eq(userIntegrations.userId, discordId),
                            eq(userIntegrations.type, 'codeforces')
                        )
                    )
                    .limit(1);

                if (rows.length > 0) {
                    await interaction.editReply({
                        content: "Your account is already linked with Codeforces.",
                    });
                    return;
                }

                // Verify the Codeforces username by asking to submit a compilation error
                const problemData = await getRandomProblem();
                if (!problemData) {
                    await interaction.editReply(
                        'Failed to fetch a valid Codeforces problem. Please try again.',
                    );
                    return;
                }

                const { problemId, problemLink } = problemData;
                const commandTimestamp = Math.floor(Date.now() / 1000);

                await interaction.editReply(
                    `To link your Codeforces account, submit a **compilation error** to the following problem within **45 seconds**:\n\n**Problem:** [${problemId}](${problemLink})\nOnce you submit the error, your account will be linked.`,
                );

                pendingValidation.set(discordId, {
                    username: username!,
                    timestamp: commandTimestamp,
                    problemId,
                });

                setTimeout(async () => {
                    const validationData = pendingValidation.get(discordId);
                    if (!validationData) return;

                    const { username, timestamp, problemId } = validationData;
                    const isCompilationError = await checkCompilationError(
                        username,
                        problemId,
                        timestamp,
                    );

                    if (isCompilationError) {
                        // Insert the new linked account
                        await db
                            .insert(userIntegrations)
                            .values({
                                externalId: username, // Save the Codeforces username as the identifier
                                userId: discordId,
                                type: 'codeforces',
                            });

                        await interaction.followUp(
                            `✅ Your Discord account has been successfully linked to **${username}**.`
                        );

                        pendingValidation.delete(discordId);
                    } else {
                        await interaction.followUp(
                            `❌ You failed to submit a compilation error within the 45 seconds time limit. Please try again.`,
                        );
                        pendingValidation.delete(discordId);
                    }
                }, 25000);

            } else if (interaction.options.getSubcommand() === 'unlink') {
                await interaction.deferReply();
                // Handle unlinking
                const rows = await db
                    .select()
                    .from(userIntegrations)
                    .where(
                        and(
                            eq(userIntegrations.userId, discordId),
                            eq(userIntegrations.type, 'codeforces')
                        )
                    )
                    .limit(1);

                if (rows.length === 0) {
                    await interaction.editReply({
                        content: "Your Codeforces account is not linked.",
                    });
                    return;
                }

                await db
                    .delete(userIntegrations)
                    .where(
                        and(
                            eq(userIntegrations.userId, discordId),
                            eq(userIntegrations.type, 'codeforces')
                        )
                    );

                await interaction.editReply({
                    content: "Your Codeforces account has been successfully unlinked.",
                });
            } else if (interaction.options.getSubcommand() === 'stats') {
                await interaction.deferReply();
                const rows = await db
                    .select()
                    .from(userIntegrations)
                    .where(
                        and(
                            eq(userIntegrations.userId, discordId),
                            eq(userIntegrations.type, 'codeforces')
                        )
                    );
            
                if (rows.length === 0) {
                    await interaction.editReply({
                        content:
                            "You haven't linked your Codeforces account yet. Please link your account first.",
                    });
                    return;
                }
                
                const username = rows[0].externalId;
            
                try {
                    const [userInfoRes, userStatusRes, userRatingRes] = await Promise.all([
                        fetch(`https://codeforces.com/api/user.info?handles=${username}`).then((res) => res.json()),
                        fetch(`https://codeforces.com/api/user.status?handle=${username}`).then((res) => res.json()),
                        fetch(`https://codeforces.com/api/user.rating?handle=${username}`).then((res) => res.json()),
                    ]);
            
                    if (
                        userInfoRes.status === 'OK' &&
                        userStatusRes.status === 'OK' &&
                        userRatingRes.status === 'OK'
                    ) {
                        const user = userInfoRes.result[0];
                        const problemsSolved = countSolvedProblems(userStatusRes.result);
                        const contestsParticipated = userRatingRes.result.length;
                        const formattedRank = user.rank ? toCamelCase(user.rank) : 'N/A';
            
                        const embed = {
                            title: `${user.firstName || ''} ${user.lastName || ''} (${username})`,
                            description: `Codeforces Profile for ${username}`,
                            fields: [
                                {
                                    name: 'Member Since',
                                    value: new Date(user.registrationTimeSeconds * 1000).toLocaleDateString(),
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
                        await interaction.editReply({ embeds: [embed] });
                    } else {
                        await interaction.editReply({
                            content: 'An error occurred while fetching data. Please try again later.',
                        });
                    }
                } catch (err) {
                    logger.error(`Error fetching Codeforces profile: ${err}`);
                    await interaction.editReply({
                        content: 'An error occurred while fetching your profile. Please try again later.',
                    });
                }
            }            
        } catch (err) {
            logger.error(`Error processing command: ${err}`);
            await interaction.editReply({
                content: 'An error occurred while processing your request. Please try again later.',
            });
        }
    },
} satisfies SlashCommand;
