import {
  ExceptionFilter, Catch, ArgumentsHost, HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

// Importá tipos de Sequelize (no instancias)
import {
  ValidationError as SequelizeValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
} from 'sequelize';

@Catch()
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx     = host.switchToHttp();
    const res     = ctx.getResponse<Response>();
    const req     = ctx.getRequest<Request>();
    const isProd  = process.env.NODE_ENV === 'production';

    // --- Sequelize ValidationError ---
    if (exception?.name === 'SequelizeValidationError' || exception instanceof SequelizeValidationError) {
      const errors = (exception.errors ?? []).map((e: any) => ({
        path: e.path,
        validator: e.validatorKey,
        message: e.message,
        value: sanitizeValue(e.value),
      }));
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        message: 'Validation failed',
        details: errors,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- Sequelize UniqueConstraintError ---
    if (exception?.name === 'SequelizeUniqueConstraintError' || exception instanceof UniqueConstraintError) {
      const errors = (exception.errors ?? []).map((e: any) => ({
        path: e.path,
        message: e.message,
        value: sanitizeValue(e.value),
      }));
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'Unique constraint violated',
        details: errors,
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- (Opcional) FK constraint ---
    if (exception?.name === 'SequelizeForeignKeyConstraintError' || exception instanceof ForeignKeyConstraintError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Foreign Key Error',
        message: exception.message,
        details: {
          table: exception.table,
          fields: exception.fields,
        },
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- (Opcional) DatabaseError genérico (no mostrar SQL en prod) ---
    if (exception instanceof DatabaseError) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Database Error',
        message: isProd ? 'Internal database error' : exception.message,
        // Evitamos exponer SQL en producción
        details: isProd ? undefined : {
          sql: exception.sql,
          parameters: (exception as any).parameters,
          sqlMessage: (exception as any).parent?.sqlMessage || (exception as any).original?.sqlMessage,
        },
        path: req.url,
        timestamp: new Date().toISOString(),
      });
    }

    // --- Fallback: dejar que Nest maneje (o formatear genérico) ---
    const status = exception?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception?.message ?? 'Internal server error';
    return res.status(status).json({
      statusCode: status,
      error: status >= 500 ? 'Internal Server Error' : 'Bad Request',
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}

function sanitizeValue(v: unknown) {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string' && v.length > 200) return v.slice(0, 200) + '…';
  return v;
}