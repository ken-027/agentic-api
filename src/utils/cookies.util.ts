import { NODE_ENV } from "@/config/env";
import Cookies from "cookies";
import { Request, Response } from "express";

export default class Cookie {
    #cookie: Cookies;

    constructor(
        private request: Request,
        private response: Response,
        private keys: string[] = ["cookie key here"],
    ) {
        this.#cookie = new Cookies(this.request, this.response, {
            keys: this.keys,
            secure: NODE_ENV === "production",
        });
    }

    set(name: string, value: string | null) {
        this.#cookie.set(name, value);
    }

    get(name: string) {
        return this.#cookie.get(name);
    }
}
