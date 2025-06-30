import chalk from "chalk";
import { PORT, PRODUCTION } from "@/config/env";
import { initializeRedisConnection } from "./config/redis.connection";

if (PRODUCTION) {
    initializeRedisConnection();
}

import app from "./app";

app.listen(PORT, () => {
    console.log(chalk.bgYellow(" listening on port: "), chalk.yellow(PORT));
});
