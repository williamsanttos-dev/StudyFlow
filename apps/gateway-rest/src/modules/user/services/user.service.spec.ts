import { UserService } from "@/modules/user/services/user.service";
import { ConflictError } from "@/errors/ConflictError";
import { IUserRepository } from "../interfaces/user.repository.interface";
import { IHashProvider } from "@/shared/providers/hash.provider.interface";
import { CreateUserDTO } from "../models/user.schema";
import { User } from "../models/User";
import { NotFoundError } from "@/errors/NotFoundError";

describe("UserService - register", () => {
	let userService: UserService;
	let userRepository: jest.Mocked<IUserRepository>;
	let hashProvider: jest.Mocked<IHashProvider>;

	beforeEach(() => {
		userRepository = {
			findByEmailOrUsernameExist: jest.fn(),
			insertUser: jest.fn(),
			findById: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;

		hashProvider = {
			hash: jest.fn(),
		} as unknown as jest.Mocked<IHashProvider>;

		userService = new UserService(userRepository, hashProvider);
	});

	describe("register", () => {
		const baseUserData: CreateUserDTO = {
			name: "William",
			username: "william",
			email: "william@mail.com",
			birthDate: new Date("2000-01-01"),
			password: "123456",
		};

		it("should register a new user successfully", async () => {
			userRepository.findByEmailOrUsernameExist.mockResolvedValue(null);
			hashProvider.hash.mockResolvedValue("hashed-password");

			await userService.register(baseUserData);

			expect(userRepository.findByEmailOrUsernameExist).toHaveBeenCalledWith(
				baseUserData.email,
				baseUserData.username,
			);

			expect(hashProvider.hash).toHaveBeenCalledWith(baseUserData.password);

			expect(userRepository.insertUser).toHaveBeenCalledWith({
				name: baseUserData.name,
				username: baseUserData.username,
				email: baseUserData.email,
				birthDate: baseUserData.birthDate,
				passwordHash: "hashed-password",
			});
		});

		it("should throw ConflictError if email already exists", async () => {
			userRepository.findByEmailOrUsernameExist.mockResolvedValue({
				id: "1",
				name: "Other",
				username: "otheruser",
				email: baseUserData.email,
				birthDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await expect(userService.register(baseUserData)).rejects.toThrow(
				new ConflictError("Email already in use"),
			);

			expect(hashProvider.hash).not.toHaveBeenCalled();
			expect(userRepository.insertUser).not.toHaveBeenCalled();
		});

		it("should throw ConflictError if username already exists", async () => {
			userRepository.findByEmailOrUsernameExist.mockResolvedValue({
				id: "1",
				name: "Other",
				username: baseUserData.username,
				email: "other@mail.com",
				birthDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await expect(userService.register(baseUserData)).rejects.toThrow(
				new ConflictError("Username already in use"),
			);

			expect(hashProvider.hash).not.toHaveBeenCalled();
			expect(userRepository.insertUser).not.toHaveBeenCalled();
		});
	});
	describe("FetchUserService", () => {
		it("should return user response DTO correctly", async () => {
			// Arrange
			const birthDate = new Date("2000-01-01");
			const createdAt = new Date("2024-01-01");
			const updatedAt = new Date("2024-06-01");

			const mockUser: User = {
				id: "user-1",
				name: "William",
				username: "willdev",
				email: "will@test.com",
				birthDate,
				createdAt,
				updatedAt,
			} as User;

			userRepository.findById.mockResolvedValue(mockUser);

			const currentYear = new Date().getFullYear();
			const expectedAge = currentYear - birthDate.getFullYear();

			// Act
			const result = await userService.fetchUser("user-1");

			// Assert
			expect(userRepository.findById).toHaveBeenCalledWith("user-1");

			expect(result).toEqual({
				id: mockUser.id,
				name: mockUser.name,
				username: mockUser.username,
				email: mockUser.email,
				age: expectedAge,
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
			});
		});

		it("should throw NotFoundError if user does not exist", async () => {
			// Arrange
			userRepository.findById.mockResolvedValue(null);

			// Act + Assert
			await expect(
				userService.fetchUser("non-existent-id"),
			).rejects.toBeInstanceOf(NotFoundError);

			expect(userRepository.findById).toHaveBeenCalledWith("non-existent-id");
		});
	});
});
