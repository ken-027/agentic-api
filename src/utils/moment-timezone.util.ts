import { TIMEZONE } from "@/config/env";
import momentWithTZ from "moment-timezone";

export const now = momentWithTZ().tz(TIMEZONE);
