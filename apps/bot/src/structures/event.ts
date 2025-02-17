import type { ClientEvents } from 'discord.js';
import type { Bot } from './client';

export type EventDependencies = {
    client: Bot;
};

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public name: Key,
        public handler: (
            d: EventDependencies,
        ) => (...args: ClientEvents[Key]) => unknown,
    ) {}
}
