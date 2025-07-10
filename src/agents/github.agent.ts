import { GITHUB_TEMPLATE } from "@/config/agents_prompt/github.prompt";
import {
    getPublicRepositories,
    getRepository,
    getRepositoryActivities,
    getRepositoryBranches,
    getRepositoryCommits,
    listOfContributedRepo,
    listOfForkedRepo,
    listOfRepoLanguages,
} from "@/tools/github.tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

export const GithubAgent = async () => {
    const llm = await initChatModel("openai:gpt-4o-mini");
    const agent = createReactAgent({
        llm,
        tools: [
            getPublicRepositories,
            getRepositoryActivities,
            listOfContributedRepo,
            listOfRepoLanguages,
            getRepository,
            getRepositoryCommits,
            getRepositoryBranches,
            listOfForkedRepo,
        ],
        prompt: GITHUB_TEMPLATE,
    });

    return agent;
};
