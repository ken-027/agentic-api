import {
    COVER_LETTER_TEMPLATE,
    EMAIL_TEMPLATE,
    PORTFOLIO_TEMPLATE,
    SUPERVISOR_PORTFOLIO_TEMPLATE,
} from "@/config/agent_prompts.config";
import { AI_MODEL } from "@/config/env";
import {
    certificatesResource,
    contactResource,
    developerPlatform,
    experienceResource,
    projectsResource,
    servicesResource,
    skillsResource,
    sendEmailToUser,
    receiveEmail,
    pushOverNotification,
} from "@/tools/portfolio.tools";
import { SystemMessage } from "@langchain/core/messages";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Agent } from "openai/_shims";

const chat = new ChatOpenAI({
    model: AI_MODEL,
    temperature: 0,
});

export const PortfolioAgent = createReactAgent({
    llm: chat,
    tools: [
        skillsResource,
        experienceResource,
        servicesResource,
        projectsResource,
        certificatesResource,
        developerPlatform,
        contactResource,
        pushOverNotification,
    ],
    messageModifier: new SystemMessage(PORTFOLIO_TEMPLATE),
    name: "portfolio_assistant",
});

export const EmailAgent = createReactAgent({
    llm: chat,
    tools: [receiveEmail, sendEmailToUser],
    messageModifier: new SystemMessage(EMAIL_TEMPLATE),
    name: "email_assistant",
});

export const CoverLetterAgent = createReactAgent({
    llm: chat,
    tools: [
        skillsResource,
        experienceResource,
        servicesResource,
        projectsResource,
        certificatesResource,
        developerPlatform,
        contactResource,
    ],
    messageModifier: new SystemMessage(COVER_LETTER_TEMPLATE),
    name: "cover_letter_assistant",
});

export const PortfolioSupervisor = createSupervisor({
    agents: [PortfolioAgent, EmailAgent],
    llm: chat,
    prompt: SUPERVISOR_PORTFOLIO_TEMPLATE,
}).compile();

export const AgentsConfig: Record<
    Agent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { agent: any; description: string; name: string }
> = {
    portfolio: {
        agent: PortfolioSupervisor,
        name: "Portfolio Assistant",
        description: "Handles portfolio inquires",
    },
} as const;
