import 'dotenv/config';
import { getDB } from '@tcs-bhediya/db';
import { GatewayIntentBits } from 'discord.js';
import { Bot } from './structures/client';
import { readEnv } from './utils/readEnv';

const env = readEnv();
const db = getDB();
export const client = new Bot(
    { env, db },
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ],
    },
);

client.start();
