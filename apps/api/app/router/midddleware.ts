import { implement } from "@orpc/server";
import { and, db, eq, gt, session } from "@repo/database";
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

async function parse_token(authorization: string | null): Promise<User | null> {
    if (!authorization) return null;
    const [scheme, token, ...extra] = authorization.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token || extra.length > 0) {
        return null;
    }

    const [valid_session] = await db
        .select({ user_id: session.userId })
        .from(session)
        .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
        .limit(1);

    return valid_session ? { id: valid_session.user_id } : null;
}

const os = implement(contract)

export const auth_middleware = os.$context<BaseContext>().middleware(async ({ context, next, errors }) => {
    const user = await parse_token(context.headers.get("authorization"));

    if (!user) {
        throw errors.UNAUTHORIZED();
    }

    return next({ context: { user } });
})

export const optional_auth_middleware = os.$context<BaseContext>().middleware(async ({ context, next }) => {
    const user = await parse_token(context.headers.get("authorization"));

    return next({ context: { user } });
})