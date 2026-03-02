import { IHashProvider } from "@/shared/providers/hash.provider.interface";
import { IUserRepository } from "../interfaces/user.repository.interface";
import { IUserService } from "../interfaces/user.service.interface";
import { UserResponseDTO } from "../models/dto/user.response";
import { ConflictError } from "@/errors/ConflictError";
import { CreateUserDTO } from "../models/user.schema";

export class UserService implements IUserService {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly hashProvider: IHashProvider,
	) {}

	async register(data: CreateUserDTO): Promise<void> {
		const existing = await this.userRepository.findByEmailOrUsernameExist(
			data.email,
			data.username,
		);

		if (existing) {
			if (existing.email === data.email)
				throw new ConflictError("Email already in use");
			if (existing.username === data.username)
				throw new ConflictError("Username already in use");
		}

		const passwordHash = await this.hashProvider.hash(data.password);

		await this.userRepository.insertUser({
			name: data.name,
			username: data.username,
			email: data.email,
			birthDate: data.birthDate,
			passwordHash: passwordHash,
		});
	}
}
