import { Agent as AgentEnum } from "@/enum/agents.enum";
import * as z from "zod/v4";

export const Chat = z
    .object({
        message: z.string().trim().max(500).min(1),
    })
    .required();

export const Agent = z
    .object({
        agent: z.enum([AgentEnum.Portfolio]),
    })
    .required();

export type Chat = z.infer<typeof Chat>;
export type Agent = z.infer<typeof Agent>;
