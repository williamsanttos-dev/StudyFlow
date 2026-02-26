export interface IAuthService {
	login(
		email: string,
		password: string,
	): Promise<{
		accessToken: string;
		refreshToken: string;
	}>;
}
