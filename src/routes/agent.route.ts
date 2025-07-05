import { Router } from "express";
import {
    agent,
    agents,
    coverLetterAgent,
    uptimeMonitoringAgent,
} from "@/controllers/agent.controller";
import { validateRequest } from "@/middlewares/validation.middleware";
import { Chat, Agent, UptimeAgent } from "@/validations/chat.validation";
import {
    chatResourceLimit,
    webAgentLimit,
} from "@/middlewares/rate-limiter.middleware";
import { CoverLetter } from "@/validations/cover-letter.validation";

const agentRouter = Router();

agentRouter.post(
    "/cover-letter",
    validateRequest(CoverLetter, "body"),
    chatResourceLimit,
    coverLetterAgent,
);
agentRouter.post(
    "/uptime-monitoring",
    validateRequest(UptimeAgent, "body"),
    webAgentLimit,
    uptimeMonitoringAgent,
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
