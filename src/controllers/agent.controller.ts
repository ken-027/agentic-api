import { Chat, UptimeAgent } from "@/validations/chat.validation";
import { SessionMessages } from "@/types";
import { CoverLetterAgent } from "@/agents/portfolio.agents";
import { Request, Response } from "express";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { NODE_ENV } from "@/config/env";
import { CoverLetter } from "@/validations/cover-letter.validation";
import { AgentsConfig } from "@/agents";
import { WebsiteCheckerAgent } from "@/agents/uptime-monitoring.agents";

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: Get list of agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: return list of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: portfolio
 *                       description:
 *                         type: string
 *                         example: Handles portfolio inquires
 *
 */
export function agents(_req: Request, response: Response) {
    return response.json({
        agents: Object.keys(AgentsConfig).map((name) => ({
            name,
            description: AgentsConfig[name].description,
        })),
    });
}

/**
 * @swagger
 * /api/v1/agents/github:
 *   post:
 *     summary: Post message and return as stream
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What repository are you most proud of?"
 *     responses:
 *       200:
 *         description: Return answered from the question
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
/**
 * @swagger
 * /api/v1/agents/portfolio:
 *   post:
 *     summary: Post message and return as stream
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What are your Frontend projects?"
 *     responses:
 *       200:
 *         description: Return answered from the question
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
export async function agent(
    request: Request<{ agent: "portfolio" }, unknown, Chat> & {
        session: SessionMessages;
    },
    response: Response,
) {
    const { agent } = request.params;
    const { message } = request.body;

    const messages = request.session.messages || [];

    messages.push(new HumanMessage(message));

    const prompts = messages.slice(
        messages.length - (NODE_ENV === "production" ? 10 : 1),
        messages.length,
    );

    const selectedAgent = await AgentsConfig[agent].agent();
    // const selectedAgent = await PortfolioSupervisor
    const eventStream = await selectedAgent.streamEvents(
        { messages: prompts },
        { version: "v2" },
    );

    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");

    let aiResponse = "";

    for await (const { event, data } of eventStream) {
        if (event === "on_chat_model_stream") {
            if (data.chunk.content) {
                response.write(data.chunk.content);
                aiResponse += data.chunk.content;
            }
        }
    }

    messages.push(new AIMessage(aiResponse));
    request.session.messages = messages;
    response.end();
}

export async function coverLetterAgent(
    request: Request<unknown, unknown, CoverLetter> & {
        session: SessionMessages;
    },
    response: Response,
) {
    const { company, job_description, background } = request.body;

    const message = `
        Company: ${company}\n
        Background: ${background}\n
        Job Description: ${job_description}
    `;

    const messages = request.session.messages || [];

    messages.push(new HumanMessage(message));

    const prompts = messages.slice(
        messages.length - (NODE_ENV === "production" ? 10 : 1),
        messages.length,
    );

    const eventStream = (await CoverLetterAgent()).streamEvents(
        { messages: prompts },
        { version: "v2" },
    );

    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");

    let aiResponse = "";

    for await (const { event, data } of eventStream) {
        if (event === "on_chat_model_stream") {
            if (data.chunk.content) {
                response.write(data.chunk.content);
                aiResponse += data.chunk.content;
            }
        }
    }

    messages.push(new AIMessage(aiResponse));
    request.session.messages = messages;
    response.end();
}

/**
 * @swagger
 * /api/v1/agents/uptime-monitoring:
 *   post:
 *     summary: Post message and return as stream
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: url
 *                 example: "https://portfolio.ksoftdev.site"
 *     responses:
 *       200:
 *         description: Return answered from the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 siteType:
 *                   type: string
 *                   example: "Portfolio"
 *                 techs:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Next.js", "TailwindCSS", "Vercel"]
 *                 seoIssue:
 *                   type: string
 *                   example: "Missing meta description"
 *                 brokenLink:
 *                   type: string
 *                   example: "1 broken link found"
 *                 performance:
 *                   type: string
 *                   example: "Good"
 *                 security:
 *                   type: string
 *                   example: "No issues detected"
 *                 status:
 *                   type: string
 *                   enum: [DOWN, UP]
 *                   example: "UP"
 *                 description:
 *                   type: string
 *                   maxLength: 250
 *                   example: "This is a personal portfolio site built with modern web technologies."
 *                 responseTime:
 *                   type: number
 *                   example: 203.4
 */

export async function uptimeMonitoringAgent(
    request: Request<unknown, unknown, UptimeAgent> & {
        session: SessionMessages;
    },
    response: Response,
) {
    const { url } = request.body;

    const messages = request.session.messages || [];

    messages.push(new HumanMessage(url));

    const prompts = messages.slice(
        messages.length - (NODE_ENV === "production" ? 10 : 1),
        messages.length,
    );

    const agent = await WebsiteCheckerAgent();

    const result = await agent.invoke({ messages: prompts });

    return response.json(result.structuredResponse);
}
