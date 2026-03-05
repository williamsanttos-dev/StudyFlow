import type { DrizzleDatabase } from "@/types/DrizzleDatabase";
import type { ITransactionManager } from "./transaction-manager.interface";

export class DrizzleTransactionManager implements ITransactionManager {
	constructor(private db: DrizzleDatabase) {}

	runInTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
		return this.db.transaction(async (tx) => {
			return callback(tx);
		});
	}
}
