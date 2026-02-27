import { AuthService } from "./auth.service";
import { InvalidCredentialsError } from "../../../errors/InvalidCredentialsError";
import { TokenInvalidError } from "@/errors/TokenInvalidError";

describe("AuthService", () => {
	let authService: AuthService;

	const mockUserRepo = {
		findAuthUserByEmail: jest.fn(),
	};

	const mockRefreshRepo = {
		setRevokedByUserId: jest.fn(),
		create: jest.fn(),
		getTokenNotRevokedByUserId: jest.fn(),
		setTokenRevokedById: jest.fn(),
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
		verify: jest.fn(),
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
			mockRefreshRepo as any,
			mockHashProvider as any,
			mockTokenProvider as any,
			mockTransactionManager as any,
		);
	});

	describe("login", () => {
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

			expect(mockRefreshRepo.setRevokedByUserId).toHaveBeenCalledWith(
				"user-123",
			);

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
	describe("AuthService - refresh", () => {
		it("should refresh tokens successfully", async () => {
			const refreshToken = "old-refresh-token";
			const newRefreshToken = "new-refresh-token";
			const newAccessToken = "new-access-token";

			const futureDate = new Date(Date.now() + 1000 * 60 * 10);

			mockTokenProvider.verify.mockReturnValue({
				userId: "user-1",
				iat: 1,
				exp: 999999,
			});

			mockRefreshRepo.getTokenNotRevokedByUserId = jest.fn().mockResolvedValue({
				id: "refresh-id-1",
				tokenHash: "hashed-old-token",
				expiresAt: futureDate,
			});

			mockHashProvider.compare.mockResolvedValue(true);

			mockTokenProvider.sign
				.mockReturnValueOnce(newAccessToken)
				.mockReturnValueOnce(newRefreshToken);

			mockHashProvider.hash.mockResolvedValue("hashed-new-token");

			mockRefreshRepo.create.mockResolvedValue("new-refresh-id");

			const result = await authService.refresh(refreshToken);

			expect(result).toEqual({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			});

			expect(mockTokenProvider.verify).toHaveBeenCalledWith(
				refreshToken,
				"refresh",
			);

			expect(mockRefreshRepo.create).toHaveBeenCalledWith(
				"user-1",
				"hashed-new-token",
			);

			expect(mockRefreshRepo.setTokenRevokedById).toHaveBeenCalledWith(
				"new-refresh-id",
				"refresh-id-1",
			);
		});
		it("should throw TokenInvalidError if refresh token not found", async () => {
			mockTokenProvider.verify.mockReturnValue({
				userId: "user-1",
				iat: 1,
				exp: 999999,
			});

			mockRefreshRepo.getTokenNotRevokedByUserId = jest
				.fn()
				.mockResolvedValue(null);

			await expect(authService.refresh("invalid-token")).rejects.toThrow(
				TokenInvalidError,
			);
		});
		it("should throw TokenInvalidError if token is expired", async () => {
			mockTokenProvider.verify.mockReturnValue({
				userId: "user-1",
				iat: 1,
				exp: 999999,
			});

			mockRefreshRepo.getTokenNotRevokedByUserId = jest.fn().mockResolvedValue({
				id: "refresh-id-1",
				tokenHash: "hash",
				expiresAt: new Date(Date.now() - 1000), // passado
			});

			await expect(authService.refresh("expired-token")).rejects.toThrow(
				TokenInvalidError,
			);
		});
		it("should throw TokenInvalidError if hash comparison fails", async () => {
			const futureDate = new Date(Date.now() + 1000 * 60);

			mockTokenProvider.verify.mockReturnValue({
				userId: "user-1",
				iat: 1,
				exp: 999999,
			});

			mockRefreshRepo.getTokenNotRevokedByUserId = jest.fn().mockResolvedValue({
				id: "refresh-id-1",
				tokenHash: "hash",
				expiresAt: futureDate,
			});

			mockHashProvider.compare.mockResolvedValue(false);

			await expect(authService.refresh("wrong-token")).rejects.toThrow(
				TokenInvalidError,
			);
		});
	});
	describe("AuthService - logout", () => {
		it("should call setRevokedByUserId with correct userId", async () => {
			mockRefreshRepo.setRevokedByUserId.mockResolvedValue(undefined);

			await authService.logout("user-1");

			expect(mockRefreshRepo.setRevokedByUserId).toHaveBeenCalledWith("user-1");
			expect(mockRefreshRepo.setRevokedByUserId).toHaveBeenCalledTimes(1);
		});
		it("should propagate repository errors", async () => {
			mockRefreshRepo.setRevokedByUserId.mockRejectedValue(
				new Error("database error"),
			);

			await expect(authService.logout("user-1")).rejects.toThrow(
				"database error",
			);
		});
	});
});
