import { TIMEZONE } from "@/config/env";
import moment from "moment-timezone";

export const getDateTime = () => moment().tz(TIMEZONE).format();

export const getDate = () => moment().tz(TIMEZONE).format("DD-MM-yyyy");
