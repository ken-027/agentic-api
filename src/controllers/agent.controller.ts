import { Chat } from "@/validations/chat.validation";
import { SessionMessages } from "@/types";
import { AgentsConfig, CoverLetterAgent } from "@/agents/portfolio.agents";
import { Request, Response } from "express";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createSupervisor } from "@langchain/langgraph-supervisor";

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { NODE_ENV } from "@/config/env";
import { CoverLetter } from "@/validations/cover-letter.validation";

/**
 * @swagger
 * /api/v1/agents/portfolio:
 *   post:
 *     summary: Post message and return as stream
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - history
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

    const selectedAgent = await AgentsConfig[agent].agent;
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

export function agents(_req: Request, response: Response) {
    return response.json({
        agents: Object.keys(AgentsConfig).map((name) => ({
            name,
            description: AgentsConfig[name].description,
        })),
    });
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

    const eventStream = await CoverLetterAgent.streamEvents(
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

export async function agentSupervisor(_req: Request, res: Response) {
    // Tools
    const bookHotel = tool(
        async ({ hotel_name }: { hotel_name: string }) => {
            return `✅ Hotel booked: ${hotel_name}`;
        },
        {
            name: "book_hotel",
            description: "Book a hotel",
            schema: z.object({
                hotel_name: z
                    .string()
                    .describe("The name of the hotel to book"),
            }),
        },
    );

    const bookFlight = tool(
        async ({
            from_airport,
            to_airport,
        }: {
            from_airport: string;
            to_airport: string;
        }) => {
            return `✈️ Flight booked from ${from_airport} to ${to_airport}`;
        },
        {
            name: "book_flight",
            description: "Book a flight",
            schema: z.object({
                from_airport: z.string().describe("The departure airport code"),
                to_airport: z.string().describe("The arrival airport code"),
            }),
        },
    );

    const baseLLM = new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0,
    });

    const flightLLM = baseLLM.bindTools([bookFlight]);
    const hotelLLM = baseLLM.bindTools([bookHotel]);

    // Agents
    const flightAssistant = createReactAgent({
        llm: flightLLM,
        tools: [bookFlight],
        prompt: "You are a helpful assistant that handles all flight bookings.",
        name: "flight_assistant",
    });

    const hotelAssistant = createReactAgent({
        llm: hotelLLM,
        tools: [bookHotel],
        prompt: "You are a helpful assistant that handles all hotel bookings.",
        name: "hotel_assistant",
    });

    // Supervisor — use base LLM, or bindTools([]) to silence warnings
    const supervisorLLM = baseLLM.bindTools([]);

    const supervisor = createSupervisor({
        agents: [flightAssistant, hotelAssistant],
        llm: supervisorLLM,
        prompt: "You manage a hotel booking assistant and a flight booking assistant. Assign work to them one at a time.",
    }).compile();

    // Setup SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await supervisor.stream({
        messages: [
            {
                role: "user",
                content:
                    "first book a flight from BOS to JFK and then book a stay at McKittrick Hotel",
            },
        ],
    });

    console.log(stream);

    // try {
    //     for await (const chunk of stream) {
    //         res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    //     }
    // } catch (err) {
    //     console.error("Error streaming:", err);
    //     res.write(
    //         `data: ${JSON.stringify({ error: "Streaming failed." })}\n\n`,
    //     );
    // } finally {
    //     res.end();
    // }
}
