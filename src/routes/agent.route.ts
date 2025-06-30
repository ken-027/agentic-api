import { Router } from "express";
import {
    agent,
    agents,
    coverLetterAgent,
} from "@/controllers/agent.controller";
import { validateRequest } from "@/middlewares/validation.middleware";
import { Chat, Agent } from "@/validations/chat.validation";
import { chatResourceLimit } from "@/middlewares/rate-limiter.middleware";
import { CoverLetter } from "@/validations/cover-letter.validation";

const agentRouter = Router();

agentRouter.post(
    "/cover-letter",
    validateRequest(CoverLetter, "body"),
    coverLetterAgent,
);
agentRouter.post(
    "/:agent",
    validateRequest(Agent, "params"),
    validateRequest(Chat, "body"),
    chatResourceLimit,
    agent,
);
agentRouter.get("/", agents);

export default agentRouter;
