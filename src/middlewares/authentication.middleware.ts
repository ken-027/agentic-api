import { UnAuthorizedError } from "@/errors/unauthorized.error";
import { jwtVerify } from "@/utils/jwt.util";
import { devLog } from "@/utils/logger.util";
import { NextFunction, Request, Response } from "express";

export default function authentication(
    request: Request,
    _response: Response,
    next: NextFunction,
) {
    try {
        const verify = jwtVerify(request.cookies.accessToken);
        devLog(verify);
        request.user = verify.user;
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
        throw new UnAuthorizedError("Not authorized");
    }
}
