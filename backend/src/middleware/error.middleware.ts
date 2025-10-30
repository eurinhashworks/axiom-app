import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // Default error
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Une erreur inattendue est survenue',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

