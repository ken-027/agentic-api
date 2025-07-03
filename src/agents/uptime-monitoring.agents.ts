import { UPTIME_TEMPLATE } from "@/config/agents_prompt/uptime-monitoring.prompt";
import { AppStatus } from "@/enum/uptime.enum";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import * as z from "zod/v4";

const UptimeResponse = z.object({
    status: z.enum([AppStatus.DOWN, AppStatus.UP]),
    responseTime: z.number(),
    description: z.string().max(150),
});

export const WebsiteCheckerAgent = async () => {
    const llm = await initChatModel("anthropic:claude-3-7-sonnet-latest");
    const agent = createReactAgent({
        llm,
        tools: [],
        responseFormat: UptimeResponse,
        prompt: UPTIME_TEMPLATE,
    });

    return agent;
};
