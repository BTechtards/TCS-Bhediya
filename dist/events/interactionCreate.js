"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const event_1 = require("../structures/event");
const index_1 = require("../index");
exports.default = new event_1.Event("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const cmd = index_1.client.commands.get(interaction.commandName);
        if (!cmd) {
            return interaction.reply({ content: "An error has occured " });
        }
        const args = [];
        for (const option of interaction.options.data) {
            if (option.type === 1) {
                if (option.name)
                    args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value)
                        args.push(x.value);
                });
            }
            else if (option.value)
                args.push(option.value);
        }
        if (interaction.guild) {
            const member = interaction.guild.members.cache.get(interaction.user.id);
            interaction.member = member ?? null;
        }
        cmd.run({
            args: interaction.options,
            client: index_1.client,
            interaction: interaction
        });
    }
    // Context Menu Handling
    if (interaction.isUserContextMenuCommand()) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const command = index_1.client.commands.get(interaction.commandName);
        if (command) {
            command.run({
                args: interaction.options,
                client: index_1.client,
                interaction: interaction
            });
        }
    }
});
