import { UserService } from "@/modules/user/services/user.service";
import { ConflictError } from "@/errors/ConflictError";
import { IUserRepository } from "../interfaces/user.repository.interface";
import { IHashProvider } from "@/shared/providers/hash.provider.interface";
import { CreateUserDTO } from "../models/user.schema";

describe("UserService - register", () => {
	let userService: UserService;
	let userRepository: jest.Mocked<IUserRepository>;
	let hashProvider: jest.Mocked<IHashProvider>;

	const baseUserData: CreateUserDTO = {
		name: "William",
		username: "william",
		email: "william@mail.com",
		birthDate: new Date("2000-01-01"),
		password: "123456",
	};

	beforeEach(() => {
		userRepository = {
			findByEmailOrUsernameExist: jest.fn(),
			insertUser: jest.fn(),
		} as unknown as jest.Mocked<IUserRepository>;

		hashProvider = {
			hash: jest.fn(),
		} as unknown as jest.Mocked<IHashProvider>;

		userService = new UserService(userRepository, hashProvider);
	});

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
