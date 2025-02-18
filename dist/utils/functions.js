"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendHook = sendHook;
const discord_js_1 = require("discord.js");
function sendHook(webhook, title, desc, footertxt, footericon) {
    const hook = new discord_js_1.WebhookClient({ url: webhook });
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setFooter({ text: footertxt, iconURL: footericon })
        .setTimestamp()
        .setColor("Blue");
    hook.send({
        embeds: [embed],
        username: "TCS Ninja",
        avatarURL: "https://media.discordapp.net/attachments/1340728855899537521/1340738282337865773/136064936_1534520460081517_4143995848815224906_n.png?ex=67b37354&is=67b221d4&hm=5467c486b40c50ff1435d3828b71219921e05a69cb7fdb51b7f35ab963932bf2&=&format=png&quality=lossless&width=594&height=594",
    });
}
