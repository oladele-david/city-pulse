import { HttpException, HttpStatus } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    details?: unknown[],
  ) {
    super(
      {
        error: {
          code,
          message,
          details: details ?? [],
        },
      },
      status,
    );
  }
}
