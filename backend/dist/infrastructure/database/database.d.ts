import { Database } from 'sqlite';
declare let db: Database | null;
export declare const getDatabase: () => Promise<Database>;
export declare const initializeDatabase: () => Promise<void>;
export declare const closeDatabase: () => Promise<void>;
export { db as database };
//# sourceMappingURL=database.d.ts.map