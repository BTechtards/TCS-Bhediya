import { ApplicationCommandDataResolvable, Client, ClientOptions, Collection, ClientEvents } from "discord.js";
import { glob } from "glob";
import { CommandType } from "../typings/command";
import { RegisterCommandsOptions } from "../typings/client";
import { sendHook } from "../utils/functions";
import { Event } from "./event";
import log from "../utils/logger";

export class Bot extends Client {
	public commands: Collection<string, CommandType> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
	}

	start() {
		this.registerModules();
		this.login(process.env.TOKEN);
	}


	async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
		log.info("Loading application (/) commands.");

		if (guildId) {
			log.info(`Setting slash commands in ${process.env.GUILD_ID}`);
			this.guilds.cache.get(guildId)?.commands.set(commands);
		} else {
			log.error("Put a valid GUILD_ID in .env");
			process.exit();
		}

		log.info("Finished loading application (/) commands.");

	}

	async setup_error_hook() {
		let error_hook: string;

		if (process.env.ERRORLOG) {
			error_hook = process.env.ERRORLOG;
		} else {
			log.error("error log webhook url not given!");
			process.exit();
		}

		process.on("uncaughtException", (err) => {
			log.error(err.stack);
			sendHook(
				error_hook,
				"uncaughtException",
				"```" + err.stack + "```",
				this.user.username,
				this.user.avatarURL(),
			);
		});
	}

	async registerModules() {
		// commands
		const slashCommands: ApplicationCommandDataResolvable[] = [];

		const commandFiles = await glob(
			`${__dirname}/../commands/*/*{.ts,.js}`
		);

		commandFiles.forEach(async (filePath: string) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command?.name) return;

			log.info(`Loaded command "${command.name}".`);
			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		this.on("ready", async () => {
			this.registerCommands({
				commands: slashCommands,
				guildId: process.env.GUILD_ID
			});
			this.setup_error_hook();
		});

		// events
		const eventFiles = await glob(
			`${__dirname}/../events/*{.ts,.js}`
		);
		eventFiles.forEach(async (filePath: string) => {
			const event: Event<keyof ClientEvents> = await this.importFile(filePath);
			this.on(event.event, event.run);
		});
	}
}

