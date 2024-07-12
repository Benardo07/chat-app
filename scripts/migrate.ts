import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '~/server/db';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolderPath = join(__dirname, 'drizzle/migrations');

async function main() {
    await migrate(db, { migrationsFolder: migrationsFolderPath });
}

main().catch(console.error);
