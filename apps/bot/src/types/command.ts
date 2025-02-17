import type { Bot } from '@/structures/client';
import type {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    SlashCommandBuilder,
    UserContextMenuCommandInteraction,
} from 'discord.js';

export type CommandDependencies = {
    client: Bot;
};

export interface SlashCommand {
    builder: SlashCommandBuilder;
    chatCommandHandler: (
        interaction: ChatInputCommandInteraction,
        d: CommandDependencies,
    ) => unknown;
    buttonHandler?: (
        interaction: ButtonInteraction,
        d: CommandDependencies,
    ) => unknown;
}

export interface UserContextMenuCommand {
    builder: ContextMenuCommandBuilder;
    userContextMenuHandler: (
        interaction: UserContextMenuCommandInteraction,
        d: CommandDependencies,
    ) => unknown;
}

export interface MessageContextMenuCommand {
    builder: ContextMenuCommandBuilder;
    messageContextMenuHandler: (
        interaction: MessageContextMenuCommandInteraction,
        d: CommandDependencies,
    ) => unknown;
}
