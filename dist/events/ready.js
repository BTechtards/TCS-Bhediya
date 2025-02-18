"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../structures/event");
const index_1 = require("../index");
const logger_1 = require("../utils/logger");
const discord_js_1 = require("discord.js");
exports.default = new event_1.Event("ready", () => {
    logger_1.default.warn(`Logged in as ${index_1.client.user?.tag}.`);
    let memberCount = 0;
    index_1.client.guilds.cache.forEach(guild => {
        console.log(guild.memberCount);
        memberCount += guild.memberCount;
    });
    setInterval(async () => {
        const textList = [
            `${memberCount} btechtards`,
            "mommy asmr videos", // very important
        ];
        const text = textList[Math.floor(Math.random() * textList.length)];
        index_1.client.user?.setActivity(text, { type: discord_js_1.ActivityType.Watching });
    }, 30000); // milliseconds
});
