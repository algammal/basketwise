import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, SCHEMA_STATEMENTS } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Lazily opens (and migrates) the single app-wide SQLite connection. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await db.execAsync('PRAGMA journal_mode = WAL;');
      for (const statement of SCHEMA_STATEMENTS) {
        await db.execAsync(statement);
      }
      return db;
    });
  }
  return dbPromise;
}
