import { Response } from "express";

export interface AIClass {
    chat(question: string, history: SessionMessage[]): Promise<void>;
    stream(response: Response): Promise<string>;
}
