type tokensPayload = {
	accessToken: string;
	refreshToken: string;
};

export interface IAuthService {
	login(email: string, password: string): Promise<tokensPayload>;
	refresh(refreshToken: string): Promise<tokensPayload>;
	logout(userId: string): Promise<void>;
}
