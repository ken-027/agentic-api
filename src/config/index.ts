import { cwd } from "process";
import fs from "fs";
import { errorLog } from "@/utils/logger.util";

const getJWTKey = () => {
    try {
        return fs.readFileSync("jwt-secret.key");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        errorLog(err?.message);
        return "sample key here";
    }
};

export const BASE_PATH = cwd();

export const JWT_SECRET = getJWTKey();
