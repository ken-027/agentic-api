import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

interface WithErrorHandlingOptions {
  schema?: ZodSchema;
  errorHandler?: (error: Error, req: Request, res: Response) => void;
}

export const withErrorHandling = (
  handler: AsyncRequestHandler,
  options: WithErrorHandlingOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request if schema is provided
      if (options.schema) {
        const validationResult = options.schema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            error: 'Validation Error',
            details: validationResult.error.format()
          });
        }
        req.body = validationResult.data;
      }

      // Execute the handler
      await handler(req, res, next);
    } catch (error) {
      // Use custom error handler if provided
      if (options.errorHandler) {
        options.errorHandler(error as Error, req, res);
        return;
      }

      // Default error handling
      console.error('Error in route handler:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };
};
