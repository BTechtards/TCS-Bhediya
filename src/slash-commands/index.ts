import type { SlashCommand } from '@/types/command';
import ping from './info/ping';
import codeforces from './info/codeforces'
import cfprofile from './info/cfprofile';
import unlink from './info/unlink';
import linkgithub from './info/linkgithub';
import unlinkgithub from './info/unlinkgithub';
import github from './info/github';

export default [ping, codeforces, cfprofile, unlink, linkgithub, unlinkgithub, github] satisfies SlashCommand[];