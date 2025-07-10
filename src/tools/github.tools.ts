import { GITHUB_API_TOKEN } from "@/config/env";
import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";

const githubUsername = "ken-027";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const githubAPI = async (url: string, params?: Record<string, any>) => {
    const queryParams = new URLSearchParams(params);

    const { data } = await axios.get(
        `${url}${params ? `?${queryParams.toString()}` : ""}`,
        {
            headers: {
                Authorization: `Bearer ${GITHUB_API_TOKEN}`,
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/vnd.github+json",
            },
        },
    );

    return data;
};

export const getPublicRepositories = tool(
    async () => {
        const params = {
            visibility: "public",
            sort: "updated",
            direction: "desc",
        };

        const data = await githubAPI(
            `https://api.github.com/user/repos`,
            params,
        );

        const repositories = data;

        return JSON.stringify(repositories);
    },
    {
        name: "public_repositories_list",
        schema: {},
        description: "list of public repositories",
    },
);

export const getRepository = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}`,
        );

        const details = data;

        return JSON.stringify(details);
    },
    {
        name: "get_repository",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description: "get repository details",
    },
);

export const getRepositoryReadme = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}/readme`,
        );

        const readme = data;

        return JSON.stringify(readme);
    },
    {
        name: "get_repository_readme",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description: "get repository README",
    },
);

export const getRepositoryActivities = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}/activity`,
        );

        const activities = data;

        return JSON.stringify(activities);
    },
    {
        name: "repository_activities",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description:
            "List of activities that the repository has, Limit its activities by top 2 sorting from latest",
    },
);

export const listOfContributedRepo = tool(
    async () => {
        const url = `https://api.github.com/search/repositories?q=user:${githubUsername}+fork:only&per_page=100`;
        const data = await githubAPI(url);

        const forkedRepo = data.items;

        const contributedProjects = await Promise.all(
            forkedRepo.map(async ({ full_name }: { full_name: string }) => {
                const details = await githubAPI(
                    `https://api.github.com/repos/${full_name}`,
                );

                const listOfContributor = await githubAPI(
                    `https://api.github.com/repos/${details.parent.full_name}/contributors`,
                );

                return listOfContributor.find(
                    ({ login }: { login: string }) => login === githubUsername,
                )?.login
                    ? details
                    : null;
            }),
        );

        return JSON.stringify(
            contributedProjects.filter((item: unknown) => item !== null),
        );
    },
    {
        name: "contributed_repositories",
        schema: {},
        description:
            "List of contributed repository to an open source projects",
    },
);

export const listOfForkedRepo = tool(
    async () => {
        const url = `https://api.github.com/search/repositories?q=user:${githubUsername}+fork:only&per_page=100`;
        const data = await githubAPI(url);

        const forkedRepo = data.items;

        return JSON.stringify(forkedRepo);
    },
    {
        name: "forked_repositories",
        schema: {},
        description: "List of forked repositories",
    },
);

export const listOfRepoLanguages = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}/languages`,
        );

        const languages = data;

        return JSON.stringify(languages);
    },
    {
        name: "repository_programming_languages",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description: "List of programming languages of a repository",
    },
);

export const getRepositoryCommits = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}/commits`,
        );

        const commits = data;

        return JSON.stringify(commits);
    },
    {
        name: "get_repository_commits",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description: "get repository commits. return top 10 latest commits",
    },
);

export const getRepositoryBranches = tool(
    async ({ repository }) => {
        const data = await githubAPI(
            `https://api.github.com/repos/${githubUsername}/${repository}/branches`,
        );

        const branches = data;

        return JSON.stringify(branches);
    },
    {
        name: "get_repository_branches",
        schema: z.object({
            repository: z.string().trim().describe("github repository"),
        }),
        description: "get list repository branches",
    },
);
