export interface ITokenProvider {
	sign(payload: object, type: "access" | "refresh"): string;
	verify<T>(token: string, type: "access" | "refresh"): T;
}
