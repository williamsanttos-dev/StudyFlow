import type { FastifyRequest, FastifyReply } from "fastify";

export async function graphql(request: FastifyRequest, reply: FastifyReply) {
	const { query, variables, operationName } = request.body as any;

	const userId = request.user?.userId;

	const res = await fetch(process.env.GRAPHQL_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-user-id": userId,
		},
		body: JSON.stringify({
			query,
			variables,
			operationName,
		}),
	});

	const data = await res.json();
	return reply.send(data);
}
