export interface ITransactionManager {
	runInTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
