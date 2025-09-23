import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHelper {
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Error',
    statusCode: number = 500,
    errors?: string[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors !== undefined && { errors }),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'No content'): Response {
    return this.success(res, undefined, message, 204);
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    errors?: string[]
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    return this.error(res, message, 403);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }

  static conflict(
    res: Response,
    message: string = 'Conflict'
  ): Response {
    return this.error(res, message, 409);
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests'
  ): Response {
    return this.error(res, message, 429);
  }

  static internalError(
    res: Response,
    message: string = 'Internal server error'
  ): Response {
    return this.error(res, message, 500);
  }
}
