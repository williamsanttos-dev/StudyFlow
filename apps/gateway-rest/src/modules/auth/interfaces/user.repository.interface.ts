type AuthUser = {
	passwordHash: string;
	userId: string;
};

export interface IUserRepository {
	findAuthUserByEmail(email: string): Promise<AuthUser | null>;
}
