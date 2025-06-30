import chalk from "chalk";
import { NODE_ENV } from "@/config/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const devLog = (...message: any) => {
    if (NODE_ENV !== "production") {
        console.log(chalk.bgCyan(" log: "), ...message);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorLog = (...message: any) => {
    if (NODE_ENV !== "production") {
        console.log(chalk.bgRed(" error: "), ...message);
    }
};
