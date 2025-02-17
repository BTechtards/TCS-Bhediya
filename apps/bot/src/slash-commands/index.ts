import type { SlashCommand } from '@/types/command';
// import cfprofile from './info/cfprofile';
// import codeforces from './info/codeforces';
// import github from './info/github';
// import linkgithub from './info/linkgithub';
import ping from './info/ping';
// import unlink from './info/unlink';
// import unlinkgithub from './info/unlinkgithub';

export default [
    ping,
    // codeforces,
    // cfprofile,
    // unlink,
    // linkgithub,
    // unlinkgithub,
    // github,
] satisfies SlashCommand[];
