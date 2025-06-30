/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { END, START, StateGraph } from "@langchain/langgraph";

const router = express.Router();

const bookHotel = tool(
    async (input: { hotel_name: string }) => {
        // Add actual hotel booking logic here
        console.log(`Booking hotel: ${input.hotel_name}`);
        return `Successfully booked a stay at ${input.hotel_name}.`;
    },
    {
        name: "book_hotel",
        description: "Book a hotel",
        schema: z.object({
            hotel_name: z.string().describe("The name of the hotel to book"),
        }),
    },
);

const bookFlight = tool(
    async (input: { from_airport: string; to_airport: string }) => {
        // Add actual flight booking logic here
        console.log(
            `Booking flight from ${input.from_airport} to ${input.to_airport}`,
        );
        return `Successfully booked a flight from ${input.from_airport} to ${input.to_airport}.`;
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

// Initialize LLM with error handling
let llm: any;
try {
    llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        apiKey: process.env.OPENAI_API_KEY, // Make sure this is set
        temperature: 0,
    });
} catch (error) {
    console.error("Failed to initialize ChatOpenAI:", error);
    process.exit(1);
}

// Combine all tools
const tools = [bookFlight, bookHotel];

// Create tool node
const toolNode = new ToolNode(tools);

// Define the state interface
interface AgentState {
    messages: BaseMessage[];
}

// Function to call the model with tools
async function callModel(state: AgentState) {
    const modelWithTools = llm.bindTools(tools);
    const response = await modelWithTools.invoke(state.messages);
    return { messages: [response] };
}

// Function to determine if we should continue or end
function shouldContinue(state: AgentState) {
    const lastMessage = state.messages[state.messages.length - 1];

    if (
        lastMessage &&
        "tool_calls" in lastMessage &&
        lastMessage.tool_calls?.length
    ) {
        return "tools";
    }
    return END;
}

// Create the workflow graph
const workflow = new StateGraph({
    channels: {
        messages: {
            value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
            default: () => [],
        },
    },
});

// Add nodes
workflow.addNode("agent", callModel);
workflow.addNode("tools", toolNode);

// Set entry point
workflow.addEdge(START, "agent");

// Add conditional edges
workflow.addConditionalEdges("agent", shouldContinue, {
    tools: "tools",
    [END]: END,
});

// Add edge from tools back to agent
workflow.addEdge("tools", "agent");

// Compile the graph
const app = workflow.compile();

// API endpoint for travel booking
router.post("/api/book-travel", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("Processing request:", message);

        const results = [];
        const stream = await app.stream({
            messages: [new HumanMessage(message)],
        });

        let finalMessage = "";

        // Collect all chunks from the stream
        for await (const chunk of stream) {
            console.log("Chunk received:", chunk);
            results.push(chunk);

            // Extract the final response
            if (chunk.agent && chunk.agent.messages) {
                const lastMsg =
                    chunk.agent.messages[chunk.agent.messages.length - 1];
                if (lastMsg && lastMsg.content) {
                    finalMessage = lastMsg.content;
                }
            }
        }

        res.json({
            success: true,
            response: finalMessage,
            results: results,
            message: "Travel booking request processed",
        });
    } catch (error) {
        console.error("Error processing travel booking:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
});

export default router;
