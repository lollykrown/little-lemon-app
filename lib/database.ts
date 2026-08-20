import * as SQLite from 'expo-sqlite';
import type { Item } from './utils';

const dbPromise = SQLite.openDatabaseAsync('little_lemon');

export const initDatabase = async () => {
  const db = await dbPromise;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL
    );
  `);

  return db;
};

export const getMenu = async (): Promise<Item[]> => {
  const db = await initDatabase();

  const rows = await db.getAllAsync<Item>(`
    SELECT
      name,
      description,
      price,
      image,
      category
    FROM menu
    ORDER BY name ASC
  `);

  return rows;
};

export const saveMenu = async (menu: Item[]) => {
  const db = await initDatabase();

  await db.withTransactionAsync(async () => {
    for (const item of menu) {
      await db.runAsync(
        `
        INSERT INTO menu (
          name,
          description,
          price,
          image,
          category
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        item.name,
        item.description,
        item.price,
        item.image,
        item.category,
      );
    }
  });
};

export const resetDatabase = async () => {
  try {
    const db = await initDatabase();

    await db.execAsync(`
      DROP TABLE IF EXISTS menu;
    `);

    console.log("Database reset");
  } catch (error) {
    console.error("Failed to reset database:", error);
  }
};

export const getMenuByCategories = async (
  categories: string[]
): Promise<Item[]> => {
  const db = await initDatabase();

  if (categories.length === 0) {
    return getMenu();
  }

  const placeholders = categories.map(() => "?").join(", ");

  const query = `
    SELECT
      name,
      description,
      price,
      image,
      category
    FROM menu
    WHERE category IN (${placeholders})
    ORDER BY name ASC
  `;

  return await db.getAllAsync<Item>(query, ...categories);
};

export const getCategories = async (): Promise<string[]> => {
  const db = await initDatabase();

  const rows = await db.getAllAsync<{ category: string }>(`
    SELECT DISTINCT category
    FROM menu
    ORDER BY category ASC
  `);

  return rows.map((row) => row.category);
};
export const filterMenu = async (
  categories: string[],
  search: string
): Promise<Item[]> => {
  const db = await initDatabase();

  const conditions: string[] = [];
  const params: string[] = [];

  // Category filter
  if (categories.length > 0) {
    const placeholders = categories.map(() => "?").join(", ");

    conditions.push(
      `category IN (${placeholders})`
    );

    params.push(...categories);
  }

  // Dish name search
  if (search.trim().length > 0) {
    conditions.push(`name LIKE ?`);

    params.push(`%${search.trim()}%`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const query = `
    SELECT
      name,
      description,
      price,
      image,
      category
    FROM menu
    ${whereClause}
    ORDER BY name ASC
  `;

  return await db.getAllAsync<Item>(
    query,
    ...params
  );
};