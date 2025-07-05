import { UPTIME_TEMPLATE } from "@/config/agents_prompt/uptime-monitoring.prompt";
import { AppStatus } from "@/enum/uptime.enum";
import { getWebsiteContent } from "@/tools/uptime-monitoring.tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import * as z from "zod/v4";

const UptimeResponse = z.object({
    siteType: z.string(),
    tech: z.string(),
    seoIssue: z.string(),
    brokenLink: z.string(),
    performance: z.string(),
    security: z.string(),
    status: z.enum([AppStatus.DOWN, AppStatus.UP]),
    description: z.string().max(250),
});

export const WebsiteCheckerAgent = async () => {
    const llm = await initChatModel("anthropic:claude-3-5-haiku-latest");
    const agent = createReactAgent({
        llm,
        tools: [getWebsiteContent],
        responseFormat: UptimeResponse,
        prompt: UPTIME_TEMPLATE,
    });

    return agent;
};
