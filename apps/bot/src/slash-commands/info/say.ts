import type { SlashCommand } from "@/types/command";
import { SlashCommandBuilder } from "discord.js";

export default {
    builder: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sends a message in a specific channel or replies to a specific message.")
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send")
                .setRequired(true) // Required option comes first
        )
        .addStringOption(option =>
            option.setName("messageid")
                .setDescription("The ID of the message to reply to (optional)")
                .setRequired(false) // Optional comes after
        ),

    chatCommandHandler: async (interaction, { client }) => {
        const requiredRoleId = "1340728482329788529";
        const channelId = "1273909038056476714";

        if (!interaction.member || !interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command!",
                ephemeral: true
            });
        }

        const messageId = interaction.options.getString("messageid");
        const replyMessage = interaction.options.getString("message", true);

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) {
                return interaction.reply({
                    content: "❌ The specified channel is not a text channel or does not exist.",
                    ephemeral: true
                });
            }

            if (messageId) {
                try {
                    const message = await channel.messages.fetch(messageId);
                    await message.reply(replyMessage);
                } catch {
                    return interaction.reply({
                        content: "❌ The message with the given ID was not found.",
                        ephemeral: true
                    });
                }
            } else {
                await channel.send(replyMessage);
            }

            interaction.reply({
                content: "✅ Your message has been sent!",
                ephemeral: true
            });

        } catch (error) {
            console.error("Error in /say command:", error);
            interaction.reply({
                content: "❌ An error occurred while processing your request.",
                ephemeral: true
            });
        }
    },
} satisfies SlashCommand;
