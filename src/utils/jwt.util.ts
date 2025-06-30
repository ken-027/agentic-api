import { JWT_SECRET } from "@/config";
import jwtPackage, { JwtPayload } from "jsonwebtoken";

export const jwt = (payload: string | object | Buffer) =>
    jwtPackage.sign(payload, JWT_SECRET, { expiresIn: 1000 });

export const jwtVerify = <T>(token: string) =>
    jwtPackage.verify(token, JWT_SECRET) as T & JwtPayload;

export const jwtDecode = <T>(token: string) =>
    jwtPackage.decode(token) as T & JwtPayload;
