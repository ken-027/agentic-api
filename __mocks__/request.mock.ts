import { Request, Response } from "express";

export const mockRequest = {} as Request;

export const mockResponse = {
    json: jest.fn(),
} as unknown as Response;
