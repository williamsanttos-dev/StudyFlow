import { AuthService } from "./auth.service";
import { InvalidCredentialsError } from "../../../errors/InvalidCredentialsError";

describe("AuthService - login", () => {
	let authService: AuthService;

	const mockUserRepo = {
		findAuthUserByEmail: jest.fn(),
	};

	const mockRefreshRepo = {
		setRevokedByUserId: jest.fn(),
		create: jest.fn(),
	};

	const mockUserRepositoryFactory = {
		create: jest.fn().mockReturnValue(mockUserRepo),
	};

	const mockRefreshRepositoryFactory = {
		create: jest.fn().mockReturnValue(mockRefreshRepo),
	};

	const mockHashProvider = {
		compare: jest.fn(),
		hash: jest.fn(),
	};

	const mockTokenProvider = {
		sign: jest.fn(),
	};

	const mockTransactionManager = {
		runInTransaction: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockTransactionManager.runInTransaction.mockImplementation(
			async (callback: any) => {
				const fakeTx = {};
				return callback(fakeTx);
			},
		);

		authService = new AuthService(
			mockUserRepositoryFactory as any,
			mockRefreshRepositoryFactory as any,
			mockHashProvider as any,
			mockTokenProvider as any,
			mockTransactionManager as any,
		);
	});

	it("should return access and refresh tokens when credentials are valid", async () => {
		const fakeUser = {
			userId: "user-123",
			passwordHash: "hashed-password",
		};

		mockUserRepo.findAuthUserByEmail.mockResolvedValue(fakeUser);
		mockHashProvider.compare.mockReturnValue(true);

		mockTokenProvider.sign
			.mockReturnValueOnce("access-token")
			.mockReturnValueOnce("refresh-token");

		mockHashProvider.hash.mockResolvedValue("hashed-refresh-token");

		const result = await authService.login("test@mail.com", "123456");

		expect(result).toEqual({
			accessToken: "access-token",
			refreshToken: "refresh-token",
		});

		expect(mockTransactionManager.runInTransaction).toHaveBeenCalled();

		expect(mockUserRepositoryFactory.create).toHaveBeenCalled();
		expect(mockRefreshRepositoryFactory.create).toHaveBeenCalled();

		expect(mockUserRepo.findAuthUserByEmail).toHaveBeenCalledWith(
			"test@mail.com",
		);

		expect(mockRefreshRepo.setRevokedByUserId).toHaveBeenCalledWith("user-123");

		expect(mockRefreshRepo.create).toHaveBeenCalledWith(
			"user-123",
			"hashed-refresh-token",
		);
	});

	it("should throw InvalidCredentialsError if user does not exist", async () => {
		mockUserRepo.findAuthUserByEmail.mockResolvedValue(null);

		await expect(authService.login("wrong@mail.com", "123456")).rejects.toBe(
			InvalidCredentialsError,
		);
	});

	it("should throw InvalidCredentialsError if password is invalid", async () => {
		const fakeUser = {
			userId: "user-123",
			passwordHash: "hashed-password",
		};

		mockUserRepo.findAuthUserByEmail.mockResolvedValue(fakeUser);
		mockHashProvider.compare.mockReturnValue(false);

		await expect(
			authService.login("test@mail.com", "wrong-password"),
		).rejects.toBe(InvalidCredentialsError);
	});
});
