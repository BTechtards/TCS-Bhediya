import { Event } from '@/structures/event';
import type { CommandDependencies } from '@/types/command';
import { logger } from '@/utils/logger';

export default new Event('interactionCreate', (d) => async (interaction) => {
    const cmdDeps: CommandDependencies = {
        client: d.client,
        db: d.db,
    };

    if (interaction.isChatInputCommand()) {
        const cmd = d.client.slashCommands.get(interaction.commandName);
        if (!cmd) {
            return interaction.reply({
                content: 'Unable to resolve command name',
                options: {
                    flags: 'Ephemeral',
                },
            });
        }

        try {
            return cmd.chatCommandHandler(interaction, cmdDeps);
        } catch (err: unknown) {
            logger.error(
                `Error executing slash command ${interaction.commandName}\n`,
                err,
            );
        }
    }

    if (interaction.isButton()) {
        const commandName = interaction.customId.split('|')[0];
        const cmd = d.client.slashCommands.get(commandName);
        if (!cmd) {
            return interaction.reply({
                content: 'Unable to resolve command name',
                options: {
                    flags: 'Ephemeral',
                },
            });
        }

        try {
            if (cmd.buttonHandler)
                return cmd.buttonHandler(interaction, cmdDeps);
            else return;
        } catch (err: unknown) {
            logger.error(
                `Error executing button handler for ${commandName}\n`,
                err,
            );
        }
    }

    if (interaction.isUserContextMenuCommand()) {
        const cmd = d.client.userContextMenuCommands.get(
            interaction.commandName,
        );
        if (!cmd) {
            return interaction.reply({
                content: 'Unable to resolve command name',
                options: {
                    flags: 'Ephemeral',
                },
            });
        }

        try {
            return cmd.userContextMenuHandler(interaction, cmdDeps);
        } catch (err: unknown) {
            logger.error(
                `Error executing user context menu command ${interaction.commandName}\n`,
                err,
            );
        }
    }

    if (interaction.isMessageContextMenuCommand()) {
        const cmd = d.client.messageContextMenuCommands.get(
            interaction.commandName,
        );
        if (!cmd) {
            return interaction.reply({
                content: 'Unable to resolve command name',
                options: {
                    flags: 'Ephemeral',
                },
            });
        }

        try {
            return cmd.messageContextMenuHandler(interaction, cmdDeps);
        } catch (err: unknown) {
            logger.error(
                `Error executing message context menu command ${interaction.commandName}\n`,
                err,
            );
        }
    }
});
