import { NextResponse } from 'next/server';
import { AppError } from './errors';
import { ZodError } from 'zod';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(error: unknown) {
  console.error('Error en API:', error);

  // Error de validación Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error de validación',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Error de aplicación
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Error genérico
  return NextResponse.json(
    {
      success: false,
      error: 'Error interno del servidor',
    },
    { status: 500 }
  );
}
