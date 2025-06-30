import {
    EJS_PRIVATE_KEY,
    EJS_PUBLIC_KEY,
    EJS_RESPONSE_TEMPLATE_ID,
    EJS_SERVICE_ID,
    EJS_TEMPLATE_ID,
} from "@/config/env";
import emailjs from "@emailjs/nodejs";

interface EmailResponse {
    status: number;
    text: string;
}

export default class EmailJS {
    #email: string;
    #subject: string = "";
    #message: string = "";
    #name: string = "";

    constructor(email: string) {
        this.#email = email;
    }

    setSubject(subject: string) {
        this.#subject = subject;
    }

    setMessage(message: string) {
        this.#message = message;
    }

    setName(name: string) {
        this.#name = name;
    }

    #validateAttributes() {
        if (!this.#name) throw new Error("Please include a name");
        if (!this.#subject) throw new Error("Please include a subject");
        if (!this.#message) throw new Error("Please include a message");
    }

    async send(): Promise<EmailResponse> {
        try {
            const serviceId = EJS_SERVICE_ID;
            const templateId = EJS_TEMPLATE_ID;
            const publicKey = EJS_PUBLIC_KEY;
            const privateKey = EJS_PRIVATE_KEY;

            this.#validateAttributes();

            const result = await emailjs.send(
                serviceId,
                templateId,
                {
                    name: this.#name,
                    email: this.#email,
                    subject: this.#subject,
                    message: this.#message,
                },
                {
                    publicKey,
                    privateKey,
                },
            );
            return result;
        } catch (error) {
            console.error(error);
            const { status, text } = error as EmailResponse;
            return { status, text };
        }
    }

    async sendResponse(): Promise<EmailResponse> {
        try {
            const serviceId = EJS_SERVICE_ID;
            const templateId = EJS_RESPONSE_TEMPLATE_ID;
            const publicKey = EJS_PUBLIC_KEY;
            const privateKey = EJS_PRIVATE_KEY;

            this.#validateAttributes();

            const result = await emailjs.send(
                serviceId,
                templateId,
                {
                    name: this.#name,
                    email: this.#email,
                    subject: this.#subject,
                    message: this.#message,
                },
                {
                    publicKey,
                    privateKey,
                },
            );
            return result;
        } catch (error) {
            console.error(error);
            const { status, text } = error as EmailResponse;
            return { status, text };
        }
    }
}
