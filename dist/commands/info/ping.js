"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../structures/command");
exports.default = new command_1.Command({
    name: "ping",
    description: "Returns websocket ping.",
    run: async ({ client, interaction }) => {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        interaction.editReply({ content: `${ping} ms | ${client.ws.ping} ms` });
    },
});
