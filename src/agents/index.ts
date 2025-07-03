import { Agent } from "openai/_shims";
import { PortfolioSupervisor } from "./portfolio.agents";

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
