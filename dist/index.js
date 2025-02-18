"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const client_1 = require("./structures/client");
exports.client = new client_1.Bot({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.GuildMembers],
});
exports.client.start();
