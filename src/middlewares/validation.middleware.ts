import { NextFunction, Request, Response } from "express";
import * as z from "zod/v4";
export function validateRequest(
    schema: z.ZodSchema,
    type: "body" | "query" | "params",
) {
    return (request: Request, _response: Response, next: NextFunction) => {
        schema.parse(request[type as never]);
        next();
    };
}
