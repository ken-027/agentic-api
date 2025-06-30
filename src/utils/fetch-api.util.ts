import axios, {
    AxiosError as IAxiosError,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import { errorLog } from "./logger.util";

export default async function fetchAPI(
    url: string,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse | never> {
    try {
        const res = await axios(url, options);

        return res;
    } catch (error: unknown) {
        const { message, code } = error as IAxiosError;

        errorLog(code, message);
        throw error;
    }
}
