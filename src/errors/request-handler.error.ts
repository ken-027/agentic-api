import { HTTPCodes } from "@/enum/http.enum";

export interface IRequestHandlerError {
    statusCode: number;
    statusMessage: string;
    errorMessage: string;
}

export class RequestHandlerError extends Error {
    statusCode: number = HTTPCodes.InternalServerError;
    errorMessage: string;

    constructor(message: string) {
        super(message);
        this.name = "BadRequest";
        this.errorMessage = message;
    }
}
