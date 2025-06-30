import { NotFoundError } from "@/errors/not-found.error";
import { Request } from "express";

export default function NotFound(req: Request) {
    throw new NotFoundError(`Path ${req.url} not found`);
}
