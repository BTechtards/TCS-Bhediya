"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const glob_1 = require("glob");
const functions_1 = require("../utils/functions");
const logger_1 = require("../utils/logger");
class Bot extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    constructor(options) {
        super(options);
    }
    start() {
        this.registerModules();
        this.login(process.env.TOKEN);
    }
    async importFile(filePath) {
        return (await Promise.resolve(`${filePath}`).then(s => require(s)))?.default;
    }
    async registerCommands({ commands, guildId }) {
        logger_1.default.info("Loading application (/) commands.");
        if (guildId) {
            logger_1.default.info(`Setting slash commands in ${process.env.GUILD_ID}`);
            this.guilds.cache.get(guildId)?.commands.set(commands);
        }
        else {
            logger_1.default.error("Put a valid GUILD_ID in .env");
            process.exit();
        }
        logger_1.default.info("Finished loading application (/) commands.");
    }
    async setup_error_hook() {
        let error_hook;
        if (process.env.ERRORLOG) {
            error_hook = process.env.ERRORLOG;
        }
        else {
            logger_1.default.error("error log webhook url not given!");
            process.exit();
        }
        process.on("uncaughtException", (err) => {
            logger_1.default.error(err.stack);
            (0, functions_1.sendHook)(error_hook, "uncaughtException", "```" + err.stack + "```", this.user.username, this.user.displayAvatarURL());
        });
    }
    async registerModules() {
        // commands
        const slashCommands = [];
        const commandFiles = await (0, glob_1.glob)(`${__dirname}/../commands/*/*{.ts,.js}`);
        commandFiles.forEach(async (filePath) => {
            const command = await this.importFile(filePath);
            if (!command?.name)
                return;
            logger_1.default.info(`Loaded command "${command.name}".`);
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
        const eventFiles = await (0, glob_1.glob)(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async (filePath) => {
            const event = await this.importFile(filePath);
            this.on(event.event, event.run);
        });
    }
}
exports.Bot = Bot;
