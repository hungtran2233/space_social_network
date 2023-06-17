import { HttpException, HttpStatus } from '@nestjs/common';

// 200, 201  Ok, Created
const successCode = (statusCode: number, message: string, data: any) => {
    return { statusCode: statusCode, message: message, content: data };
};

const failCode = (statusCode: number, message: string) => {
    return { statusCode: statusCode, message: message };
};

// 401:  Unauthorized
const unauthorized = (mes: string) => {
    throw new HttpException(mes, HttpStatus.UNAUTHORIZED);
};

// 404: Not found
const notFound = (mes: string) => {
    throw new HttpException(mes, HttpStatus.NOT_FOUND);
};

// 409:  Conflict (đã tồn tại)
const conflict = (mes: string) => {
    throw new HttpException(mes, HttpStatus.CONFLICT);
};

export { successCode, unauthorized, conflict, notFound };
