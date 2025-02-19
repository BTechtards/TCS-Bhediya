import type { SlashCommand } from '@/types/command';
import codeforces from './info/codeforces';
// import github from './info/github';
// import linkgithub from './info/linkgithub';
import ping from './info/ping';
import say from './info/say';
// import unlinkgithub from './info/unlinkgithub';

export default [
    ping,
    say,
    codeforces
    // codeforces,
    // cfprofile,
    // unlink,
    // linkgithub,
    // unlinkgithub,
    // github,
] satisfies SlashCommand[];
