import { PostgresError } from 'postgres';

// Example error:
// {
//     "name": "PostgresError",
//     "severity_local": "ERROR",
//     "severity": "ERROR",
//     "code": "23505",
//     "detail": "Key (email)=(abcd@gmail.com) already exists.",
//     "schema_name": "public",
//     "table_name": "users",
//     "constraint_name": "users_email_unique",
//     "file": "nbtinsert.c",
//     "line": "664",
//     "routine": "_bt_check_unique"
// }

export const isPgError = (err: unknown): err is PostgresError => err instanceof PostgresError;

// https://hackage.haskell.org/package/postgresql-error-codes-1.0.1/docs/PostgreSQL-ErrorCodes.html
export const isFKeyViolation = (err: PostgresError) => err.code === '23503';
export const isUniqueViolation = (err: PostgresError) => err.code === '23505';
export const isCheckViolation = (err: PostgresError) => err.code === '23514';
