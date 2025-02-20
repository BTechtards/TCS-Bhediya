import type { SlashCommand } from "@/types/command";
import { logger } from "@/utils/logger";
import { SlashCommandBuilder, WebhookClient } from "discord.js";
import { config } from "dotenv";

config();

const logWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const webhookClient = logWebhookUrl ? new WebhookClient({ url: logWebhookUrl }) : null;

export default {
    builder: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Sends a message in a specific channel or replies to a specific message.")
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("messageid")
                .setDescription("The ID of the message to reply to (optional)")
                .setRequired(false)
        ),

    chatCommandHandler: async (interaction, { client }) => {
        const requiredRoleId = "1340728482329788529";
        const channelId = interaction.channelId;

        if (!interaction.member || !interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: "❌ You don't have permission to use this command!",
                ephemeral: true
            });
        }

        const messageId = interaction.options.getString("messageid");
        const replyMessage = interaction.options.getString("message", true);

        logger.info(interaction.user.displayName);
        logger.info(replyMessage);

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
// 
            if (webhookClient) {
                const logEmbed = {
                    description: `A message was sent using the \`/say\` command.`,
                    color: 0x5865F2,
                    fields: [
                        {
                            name: "Original Author: ",
                            value: `<@${interaction.user.id}>`,
                            inline: true,
                        },
                        {
                            name: "Channel Posted:",
                            value: `<#${channelId}>`,
                            inline: true,
                        },
                        {
                            name: "Message: ",
                            value: `${replyMessage}`,
                        },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Username: ${interaction.user.displayName}`,
                        icon_url: interaction.user.displayAvatarURL(),
                    },
                };

                webhookClient.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error("Error in /say command:", error);
            interaction.reply({
                content: "❌ An error occurred while processing your request.",
                ephemeral: true
            });
        }
    },
} satisfies SlashCommand;