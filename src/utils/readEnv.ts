import { z } from 'zod';

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1),
    REPORT_LOG_URL: z.string().url(),
    ERROR_LOG_URL: z.string().url(),
    DEV_GUILD_ID: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(): Env {
    const maybeEnv: Partial<Env> = {
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        REPORT_LOG_URL: process.env.REPORT_LOG_URL,
        ERROR_LOG_URL: process.env.ERROR_LOG_URL,
        DEV_GUILD_ID: process.env.DEV_GUILD_ID,
    };

    const parseResult = envSchema.safeParse(maybeEnv);
    if(!parseResult.success) {
        throw new Error('Invalid environment variables', { cause: parseResult.error });
    }

    return parseResult.data;
}
