import type { SlashCommand } from '@/types/command';
import { SlashCommandBuilder } from 'discord.js';

export default {
    builder: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns websocket ping'),
    chatCommandHandler: async (interaction, { client }) => {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply({ content: `${ping} ms | ${client.ws.ping} ms` });
    },
} satisfies SlashCommand;
