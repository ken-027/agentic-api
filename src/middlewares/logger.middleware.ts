import { NODE_ENV } from "@/config/env";
import { getDate } from "@/utils/date.utils";
import fs from "fs";
import path from "path";

export default function logger() {
    const currentDate = getDate();
    const logDirectory = `/tmp/logs`;

    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    const filePath = path.join(logDirectory, `${currentDate}-requests.log`);

    return NODE_ENV === "production"
        ? fs.createWriteStream(filePath, { flags: "a" })
        : undefined;
}
