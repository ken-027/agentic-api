import { SessionData } from "express-session";
import { Request } from "express";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";

export interface Chat {
    message: string;
}

export interface Email {
    name: string;
    subject: string;
    email: string;
    message: string;
}

export interface Certificate {
    name: string;
    platform: string;
    provider: string;
    platformLogo?: string;
    dateCompleted?: Date;
    certificateLink?: string;
    certificateImage?: string;
    courseLink?: string;
    skills: string[];
    status: "ongoing" | "plan" | "completed";
}

export interface Contact {
    name: string;
    link: string;
}

export interface Experience {
    title: string;
    company: string;
    location: string;
    startDate: Date;
    endDate: Date | "Present";
    descriptions: string[];
    companyLogo?: string;
    projects: Project[];
    companyLink?: string;
}

export type Category = "fullstack" | "frontend" | "backend";

export type ProjectType = "personal" | "freelance" | "company";

export interface Project {
    thumbnailLink?: string;
    title: string;
    description: string;
    technologies: ItemSkill[];
    githubRepo?: string;
    liveDemo?: string;
    screenshot?: string;
    category: Category;
    type: ProjectType;
    aiPowered?: boolean;
    dockerLink?: string;
}

export const CATEGORIES: Category[] = ["frontend", "backend", "fullstack"];

export type ProjectName =
    | "casa"
    | "casa_api"
    | "fixed_asset"
    | "portfolio"
    | "dashboard"
    | "job_posting"
    | "invoice_crud"
    | "wiwo"
    | "libre"
    | "educat"
    | "agency_match"
    | "trabook"
    | "e_commerce"
    | "mta"
    | "llda"
    | "csrm"
    | "csrm_api"
    | "ema"
    // | "recipe_api"
    // | "order_api"
    | "rustify"
    | "anime_dialog_translator"
    | "py_to_any"
    | "portfolio_api"
    | "portfolio_terminal"
    | "gradio_portfolio_chatbot"
    | "ai_deep_research"
    | "resume_match_gradio"
    | "resume_match_ai";

export interface Service {
    title: string;
    description: string;
    image: string;
}

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Proficiency = "beginner" | "intermediate" | "expert";

export interface ItemSkill {
    name: string;
    level: Level;
    proficiency: Proficiency;
    icon: string;
}

export interface Skill {
    name: string;
    items: ItemSkill[];
}

export type SessionMessage = HumanMessage | ChatMessage | AIMessage
export interface SessionMessages extends SessionData {
    messages?: SessionMessage[];
}

export type SessionRequest = Request & {
    session: SessionMessages;
};

export interface DeveloperPlatform {
    icon: string;
    link: string;
    name: string;
}
