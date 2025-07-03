import {
    COVER_LETTER_TEMPLATE,
    EMAIL_TEMPLATE,
    PORTFOLIO_TEMPLATE,
    SUPERVISOR_PORTFOLIO_TEMPLATE,
} from "@/config/agents_prompt/portfolio.prompt";
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
import { initChatModel } from "langchain/chat_models/universal";

export const PortfolioAgent = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");

    return createReactAgent({
        llm,
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
};
export const EmailAgent = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");

    return createReactAgent({
        llm,
        tools: [receiveEmail, sendEmailToUser],
        messageModifier: new SystemMessage(EMAIL_TEMPLATE),
        name: "email_assistant",
    });
};

export const CoverLetterAgent = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");

    return createReactAgent({
        llm,
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
};

export const PortfolioSupervisor = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");

    const pAgent = await PortfolioAgent();
    const eAgent = await EmailAgent();

    return createSupervisor({
        agents: [pAgent, eAgent],
        llm,
        prompt: SUPERVISOR_PORTFOLIO_TEMPLATE,
    }).compile();
};
