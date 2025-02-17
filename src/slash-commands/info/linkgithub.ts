import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "@/types/command";
import { logger } from "@/utils/logger";
import fetch from "node-fetch";
import fs from "fs/promises";  // Use fs.promises for async file operations

async function getLinkedUsername(discordId: string): Promise<string | null> {
    try {
        const data = await fs.readFile("./github-links.json", "utf-8");
        const links = JSON.parse(data);
        return links[discordId] || null;
    } catch (err) {
        logger.error(`Error reading file: ${err}`);
        return null;
    }
}

async function saveGitHubLink(discordId: string, githubUsername: string): Promise<void> {
    try {
        const data = await fs.readFile("./github-links.json", "utf-8").catch(() => "{}"); // Handle case where file doesn't exist yet
        const links = JSON.parse(data);
        links[discordId] = githubUsername;  // Save new link
        await fs.writeFile("./github-links.json", JSON.stringify(links, null, 2));  // Write back to file
    } catch (err) {
        logger.error(`Error writing file: ${err}`);
    }
}

async function verifyGitHubGist(githubUsername: string, discordId: string): Promise<boolean> {
    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/gists`);
        if (!response.ok) return false;
        
        const gists = await response.json();
        return gists.some((gist: any) => gist.description.includes(`${discordId}`));
    } catch (error) {
        logger.error(`Error fetching GitHub Gists: ${error}`);
        return false;
    }
}

export default {
    builder: new SlashCommandBuilder()
        .setName("linkgithub")
        .setDescription("Link your GitHub account.")
        .addStringOption(option => 
            option.setName("username")
                .setDescription("Your GitHub username")
                .setRequired(true)
        ),
    chatCommandHandler: async (interaction) => {
        await interaction.deferReply();  // Remove ephemeral: true to make it a regular message

        const discordId = interaction.user.id;
        const githubUsername = interaction.options.getString("username");

        if (await getLinkedUsername(discordId)) {
            return await interaction.editReply("⚠️ You have already linked a GitHub account.");
        }

        await interaction.editReply(
            `To link your GitHub account, create a **GitHub Gist** with the description:  
            \`\`\`${discordId}\`\`\`  
I will verify it in **45 seconds**.`
        );

        await new Promise(resolve => setTimeout(resolve, 45000));

        const isVerified = await verifyGitHubGist(githubUsername, discordId);
        
        if (isVerified) {
            await saveGitHubLink(discordId, githubUsername);  // This will now work properly
            await interaction.editReply(`✅ Successfully linked GitHub account: [${githubUsername}](https://github.com/${githubUsername})`);
        } else {
            await interaction.editReply("❌ Verification failed. Make sure you have created the Gist correctly.");
        }
    },
} satisfies SlashCommand;
