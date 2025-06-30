import { HTTPCodes } from "@/enum/http.enum";
import { RequestHandlerError } from "@/errors/request-handler.error";
import { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod/v4";

interface ErrorResponse {
    errors: { message: string; field?: string }[];
}

export default function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (error instanceof RequestHandlerError) {
        handleRequestHandlerError(error, res);
    } else if (error instanceof AxiosError) {
        handleAxiosError(error, res);
    } else if (error instanceof ZodError) {
        handleZodError(error, res);
        // } else if (error instanceof MongooseError) {
        //     handleMongooseError(error, res);
    } else {
        handleGenericError(error, res);
    }
}

const sendErrorResponse = (
    res: Response,
    status: number,
    errorObj: ErrorResponse,
) => {
    res.status(status).json(errorObj);
};

const handleRequestHandlerError = (
    error: RequestHandlerError,
    res: Response,
) => {
    sendErrorResponse(res, error.statusCode, {
        errors: [
            {
                message: error.errorMessage,
            },
        ],
    });
};

const handleGenericError = (error: Error, res: Response) => {
    const { message, stack, name } = error;

    console.error({ name, message, stack });

    sendErrorResponse(res, HTTPCodes.InternalServerError, {
        errors: [{ message: message }],
    });
};

const handleAxiosError = (error: AxiosError, res: Response) => {
    sendErrorResponse(
        res,
        Number.isInteger(error?.code)
            ? (error.code as never)
            : HTTPCodes.InternalServerError,
        {
            errors: [{ field: error.name, message: error.message }],
        },
    );
};

const handleZodError = (error: ZodError, res: Response) => {
    const messageStructure = error.issues.map(({ message, path }) => ({
        message,
        field: path[0] as string,
    }));

    sendErrorResponse(res, HTTPCodes.BadRequest, { errors: messageStructure });
};

// const handleMongooseError = (error: MongooseError, res: Response) => {
//     const messageStructure = [
//         {
//             message: error.message,
//         },
//     ];

//     sendErrorResponse(res, HTTPCodes.BadRequest, { errors: messageStructure });
// };
