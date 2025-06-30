import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const bookHotel = tool(
    async (input: { hotel_name: string }) => {
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

export const llm = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Create specialized agents
export const flightAssistant = createReactAgent({
    llm,
    tools: [bookFlight],
    prompt: "You are a flight booking assistant",
    name: "flight_assistant",
});

export  const hotelAssistant = createReactAgent({
    llm,
    tools: [bookHotel],
    prompt: "You are a hotel booking assistant",
    name: "hotel_assistant",
});
