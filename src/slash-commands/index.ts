import type { SlashCommand } from '@/types/command';
import ping from './info/ping';
import codeforces from './info/codeforces'

export default [ping, codeforces] satisfies SlashCommand[];