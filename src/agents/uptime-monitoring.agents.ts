import { UPTIME_TEMPLATE } from "@/config/agents_prompt/uptime-monitoring.prompt";
import { AppStatus } from "@/enum/uptime.enum";
import { getWebsiteContent } from "@/tools/uptime-monitoring.tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import z from "zod";

const UptimeResponse = z.object({
    siteType: z.string(),
    techs: z.array(z.string()),
    seoIssue: z.string(),
    brokenLink: z.string(),
    performance: z.string(),
    security: z.string(),
    status: z.enum([AppStatus.DOWN, AppStatus.UP]),
    description: z.string().max(250),
    responseTime: z.number(),
});

export const WebsiteCheckerAgent = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");
    const agent = createReactAgent({
        llm,
        tools: [getWebsiteContent],
        responseFormat: UptimeResponse,
        prompt: UPTIME_TEMPLATE,
    });

    return agent;
};
