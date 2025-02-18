import type { getDB } from '@tcs-bhediya/db';
import type { ClientEvents } from 'discord.js';
import type { Bot } from './client';

export type EventDependencies = {
    client: Bot;
    db: ReturnType<typeof getDB>;
};

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public name: Key,
        public handler: (
            d: EventDependencies,
        ) => (...args: ClientEvents[Key]) => unknown,
    ) {}
}
