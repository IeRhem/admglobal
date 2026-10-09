import { implement } from "@orpc/server";
import { contract } from "../contract";

export interface User {
    id: string;
}

export interface BaseContext {
    headers: Headers;
}

export interface AuthedContext extends BaseContext {
    user: User;
}

export interface OptionalAuthContext extends BaseContext {
    user: User | null;
}

/**
 *Extracts a user from the Bearer token. In production this would verify a JWT
 * or look up a session. for demo we treat the token as the user id.
**/

function parse_token(authorization: string | null): User | null {
    if (!authorization) return null;
    const token = authorization.split(" ")[1];
    if (!token) return null;
    return { id: token };
}

const os = implement(contract)

export const auth_middleware = os.$context<BaseContext>().middleware(async ({ context, next, errors }) => {
    const user = parse_token(context.headers.get("authorization"));

    if (!user) {
        throw errors.UNAUTHORIZED();
    }

    return next({ context: { user } });
})

export const optional_auth_middleware = os.$context<BaseContext>().middleware(async ({ context, next }) => {
    const user = parse_token(context.headers.get("authorization"));

    return next({ context: { user } });
})