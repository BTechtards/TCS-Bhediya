import * as fs from 'fs';
import type { SlashCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';

interface UserLinks {
    [discordId: string]: string;
}

const linksFilePath = './links.json';
const pendingValidation: Map<
    string,
    { username: string; timestamp: number; problemId: string }
> = new Map();

const getLinks = (): UserLinks => {
    try {
        if (!fs.existsSync(linksFilePath)) return {};
        const fileContent = fs.readFileSync(linksFilePath, 'utf8');
        return fileContent.trim() ? JSON.parse(fileContent) : {};
    } catch (error) {
        console.error('Error reading links.json:', error);
        return {};
    }
};

const saveLinks = (links: UserLinks): void => {
    try {
        fs.writeFileSync(linksFilePath, JSON.stringify(links, null, 2));
    } catch (error) {
        console.error('Error saving links.json:', error);
    }
};

const validateCodeforcesUsername = async (username: string) => {
    const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${username}`,
    );
    const data = await response.json();
    return data.status === 'OK' && data.result.length > 0;
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

const linkCodeforcesCommand: SlashCommand = {
    builder: new SlashCommandBuilder()
        .setName('linkcodeforces')
        .setDescription(
            'Links or shows your Codeforces username linked to your Discord account.',
        )
        .addStringOption((option) =>
            option
                .setName('username')
                .setDescription('Your Codeforces username')
                .setRequired(false),
        ),

    chatCommandHandler: async (interaction) => {
        const discordId = interaction.user.id;
        const links = getLinks();

        if (!interaction.options.getString('username')) {
            if (links[discordId]) {
                await interaction.reply(
                    `You already have your Codeforces account linked to: **${links[discordId]}**`,
                );
            } else {
                await interaction.reply(
                    "You haven't linked your Codeforces account yet. Please provide your username with this command.",
                );
            }
            return;
        }

        const codeforcesUsername = interaction.options.getString('username')!;
        if (links[discordId]) {
            await interaction.reply(
                `You already have your Codeforces account linked to: **${links[discordId]}**`,
            );
            return;
        }

        const existingUser = Object.entries(links).find(
            ([_, username]) => username === codeforcesUsername,
        );
        if (existingUser && existingUser[0] !== discordId) {
            await interaction.reply(
                `The Codeforces username **${codeforcesUsername}** is already linked to another Discord account.`,
            );
            return;
        }

        const isValidUsername =
            await validateCodeforcesUsername(codeforcesUsername);
        if (!isValidUsername) {
            await interaction.reply(
                'Invalid Codeforces username. Please provide a valid username.',
            );
            return;
        }

        const problemData = await getRandomProblem();
        if (!problemData) {
            await interaction.reply(
                'Failed to fetch a valid Codeforces problem. Please try again.',
            );
            return;
        }

        const { problemId, problemLink } = problemData;
        const commandTimestamp = Math.floor(Date.now() / 1000);

        await interaction.reply(
            `To link your Codeforces account, submit a **compilation error** to the following problem within **45 seconds**:\n\n**Problem:** [${problemId}](${problemLink})\nOnce you submit the error, your account will be linked.`,
        );

        pendingValidation.set(discordId, {
            username: codeforcesUsername,
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
                links[discordId] = username;
                saveLinks(links);
                pendingValidation.delete(discordId);
                await interaction.followUp(
                    `✅ Your Discord account has been successfully linked to **${username}**.`,
                );
            } else {
                await interaction.followUp(
                    `❌ You failed to submit a compilation error within the 45 seconds time limit. Please try again.`,
                );
                pendingValidation.delete(discordId);
            }
        }, 45000);
    },
};

export default linkCodeforcesCommand;
