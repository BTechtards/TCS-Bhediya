import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export function getDB(conn?: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
}) {
    return drizzle({
        connection: conn ?? {
            user: process.env.POSTGRES_USER as string,
            password: process.env.POSTGRES_PASSWORD as string,
            host: process.env.POSTGRES_HOST as string,
            port: Number(process.env.POSTGRES_PORT as string),
            database: process.env.POSTGRES_DATABASE as string,
        },
        schema: schema,
    });
}
