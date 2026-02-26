import jwt from "jsonwebtoken";

import { ITokenProvider } from "../interfaces/token.provider.interface";

export class JwtTokenProvider implements ITokenProvider {
	sign(payload: object, type: "access" | "refresh"): string {
		if (type === "access")
			return jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
				expiresIn: "12h",
			});
		return jwt.sign(payload, process.env.SECRET_REFRESH_TOKEN, {
			expiresIn: "7d",
		});
	}
	verify<T>(token: string, type: "access" | "refresh"): T {
		if (type === "access")
			return jwt.verify(token, process.env.SECRET_ACCESS_TOKEN) as T;
		return jwt.verify(token, process.env.SECRET_REFRESH_TOKEN) as T;
	}
}
