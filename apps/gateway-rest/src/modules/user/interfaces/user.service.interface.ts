import type { CreateUserDTO } from "../models/user.schema";

export interface IUserService {
	register(data: CreateUserDTO): Promise<void>;
}
