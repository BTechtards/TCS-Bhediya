import { ApplicationCommandDataResolvable, Client, ClientOptions, Collection } from "discord.js";
import { MessageContextMenuCommand, SlashCommand, UserContextMenuCommand } from "@/types/command";
// import { sendHook } from "@/utils/functions";
import { logger } from "@/utils/logger";
import { Env } from '@/utils/readEnv';
import slashCommands from '@/slash-commands';
import events from '@/events';

export type BotConfig = {
	env: Env,
}

export class Bot extends Client {
	slashCommands: Collection<string, SlashCommand> = new Collection();
	userContextMenuCommands: Collection<string, UserContextMenuCommand> = new Collection();
	messageContextMenuCommands: Collection<string, MessageContextMenuCommand> = new Collection();

	constructor(public config: BotConfig, clientOptions: ClientOptions) {
		super(clientOptions);
	}

	async start() {
		await this.registerCommands();
		await this.registerEvents();
		this.login(this.config.env.DISCORD_TOKEN);
	}

	setup_error_hook() {
		// ! Bad practice
		// let error_hook: string;

		// if (process.env.ERROR_LOG) {
		// 	error_hook = process.env.ERROR_LOG;
		// } else {
		// 	log.error("error log webhook url not given!");
		// 	process.exit();
		// }

		// process.on("uncaughtException", (err) => {
		// 	log.error(err.stack);
		// 	sendHook(
		// 		error_hook,
		// 		"uncaughtException",
		// 		"```" + err.stack + "```",
		// 		this.user!.username,
		// 		this.user!.displayAvatarURL(),
		// 	);
		// });
	}

	async registerCommands() {
		const slashCommandsData: ApplicationCommandDataResolvable[] = [];

		slashCommands.forEach(command => {
			logger.info(`Loaded command ${command.builder.name} ✅`);
			this.slashCommands.set(command.builder.name, command);
			slashCommandsData.push(command.builder.toJSON());
		});

		this.once("ready", async () => {
			const guildId = this.config.env.DEV_GUILD_ID; 

			logger.info("Loading application (/) commands.");

			// ? Dont you need to register the commands with discord
			if (guildId) {
				logger.info(`Setting slash commands in ${guildId}`);
				this.guilds.cache.get(guildId)?.commands.set(slashCommandsData);
			} else {
				logger.error("Put a valid DEV_GUILD_ID in .env");
				process.exit();
			}

			logger.info("Finished loading application (/) commands.");
			this.setup_error_hook();
		});
	}

	async registerEvents() {
		events.forEach(evt => {
			// @ts-expect-error TS is dumb and cant prove that this is correct
			this.on(evt.name, evt.handler);
		});
	}
}

