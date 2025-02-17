import type { SlashCommand } from '@/types/command';
import ping from './info/ping';

export default [ping] satisfies SlashCommand[];
