import { Command } from "@/structures/command";

export default new Command({
	name: "ping",
	description: "Returns websocket ping.",
	run: async ({ client, interaction }) => {
		await interaction.deferReply();
		const reply = await interaction.fetchReply();
		const ping = reply.createdTimestamp - interaction.createdTimestamp;

		interaction.editReply({ content: `${ping} ms | ${client.ws.ping} ms` });
	},
});
