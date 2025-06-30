import { NODE_ENV } from "@/config/env";
import {
    Certificate,
    Contact,
    DeveloperPlatform,
    Experience,
    Project,
    ProjectName,
    Service,
    Skill,
} from "@/types";
import EmailJS from "@/utils/email-js";
import PushoverNotificationUtil from "@/utils/pushover-notification.util";
import { tool } from "@langchain/core/tools";
import axios from "axios";
// import axios from "axios";
import { z } from "zod";

export const skillsResource = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/skills",
        );

        const skills = (data.skills as Skill[]).map(({ name, items }) => ({
            name,
            items: items.map(({ name, proficiency }) => ({
                name,
                proficiency,
            })),
        }));

        return `
            Skills\n
            ${JSON.stringify(skills)}
        `;
    },
    {
        name: "skills_list",
        schema: {},
        description:
            "developer skills and it's category, name of the skill and proficiency only",
    },
);

export const servicesResource = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/services",
        );

        const services = (data.services as Service[]).map(
            ({ description, title }) => ({ title, description }),
        );

        return `
            Services:
            ${JSON.stringify(services)}
        `;
    },
    {
        name: "services_list",
        schema: {},
        description: "developers services name and description only",
    },
);

export const contactResource = tool(
    () => {
        const contacts: Contact[] = [
            {
                name: "LinkedIn",
                link: "https://www.linkedin.com/in/kenneth-andales",
            },
            {
                name: "Upwork",
                link: "https://www.upwork.com/freelancers/~0135c2e932c50f312f",
            },
            {
                name: "Gmail",
                link: "mailto:keanolida7296@gmail.com",
            },
            {
                name: "Teams",
                link: "https://teams.microsoft.com/l/chat/0/0?users=keanolida7296@gmail.com",
            },
            {
                name: "Portfolio Site",
                link: "https://portfolio.ksoftdev.site",
            },
        ];

        return `
            Here are Kenneth's primary contact links:\n
            ${contacts.map((c) => `${c.name}: ${c.link}`).join("\n")}
        `;
    },
    {
        name: "contacts",
        schema: {},
        description: "Returns Kenneth's primary contact information like Gmail, Upwork, LinkedIn, Teams, and Portfolio Site",
    },
);

export const developerPlatform = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/developer-platform",
        );

        const platforms = (data.platforms as DeveloperPlatform[]).map(
            ({ link, name }) => ({ name, link }),
        );

        return `
            Platforms:
            ${JSON.stringify(platforms)}
        `;
    },
    {
        name: "developer_platform_list",
        schema: {},
        description: "developers platform use to deployed and managed apps",
    },
);

export const projectsResource = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/projects",
        );

        const projects = data.projects as Record<ProjectName, Project>;
        const projectKeys = Object.keys(projects);

        return `
            Project:
            ${JSON.stringify(projectKeys.map((name) => ({ ...projects[name as ProjectName], thumbnailLink: undefined, type: undefined })))}
        `;
    },
    {
        name: "projects_portfolio",
        schema: {},
        description:
            "developers projects/portfolios, skills used, demos and documentation of the projects",
    },
);

export const certificatesResource = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/certificates",
        );

        const certificates = (data.certificates as Certificate[]).map(
            ({ certificateImage: _a, ...item }) => ({ ...item }),
        );

        return `
            Certificates:
            ${JSON.stringify(certificates)}
        `;
    },
    {
        name: "certificates_list",
        schema: {},
        description:
            "developers certificate list. don't return images link of the certificate.",
    },
);

export const experienceResource = tool(
    async () => {
        const { data } = await axios.get(
            "https://portfolio-api.ksoftdev.site/api/v1/portfolio/experiences",
        );

        const experiences = (data.experiences as Experience[]).map(
            ({
                title,
                company,
                descriptions,
                location,
                startDate,
                endDate,
                projects,
            }) =>
                `
                Title: ${title}
                Company: ${company}
                Location: ${location}
                Description:
                    ${descriptions.join(", ")}
                Term: ${startDate} - ${endDate}
                Projects:
                    ${projects
                        .map(
                            ({
                                title,
                                description,
                                liveDemo,
                                screenshot,
                                category,
                                aiPowered,
                                dockerLink,
                                technologies,
                                type,
                            }) =>
                                `
                        Title: ${title}
                        Description: ${description}
                        Demo: ${liveDemo}
                        Screenshots: ${screenshot}
                        Category: ${category}
                        AI Powered: ${aiPowered}
                        Docker: ${dockerLink}
                        Technologies: ${technologies.map(({ name, proficiency }) => `Name: ${name}, Proficiency: ${proficiency}`).join("\n")}
                        Type: ${type}
                        `,
                        )
                        .join("\n")}
            `,
        );

        return `
            Experiences:
            ${JSON.stringify(experiences)}
        `;
    },
    {
        name: "experience_list",
        schema: {},
        description:
            "developers experiences and project and skills on each company",
    },
);

export const pushOverNotification = tool(
    ({ inquiry }) => {
        console.log({ inquiry });
        if (NODE_ENV !== "production") return;

        const pushover = new PushoverNotificationUtil();

        pushover.unknownInquiry(inquiry);

        return `Notification sent successfully to Kenneth - Unknown inquiry requiring attention`;
    },
    {
        name: "pushover_notification",
        schema: z.object({
            inquiry: z.string().trim().describe("Unanswered user inquiry text"),
        }),
        description:
            "Send push notification to Kenneth about unknown inquiries, unanswered questions, or requests that fall outside the scope of Portfolio and Email agents. Use this when no other agent can properly handle the user's request.",
    },
);

export const receiveEmail = tool(
    async ({ email, subject, message, name }) => {
        const sendEmail = new EmailJS(email);

        sendEmail.setSubject(subject);
        sendEmail.setMessage(message);
        sendEmail.setName(name || "anonymous");

        const { status, text } = await sendEmail.send();

        return `status: ${status}\ntext: ${text}`;
    },
    {
        name: "receive_email_to_developer",
        schema: z.object({
            email: z
                .string()
                .email()
                .describe("email of a user who wants to contact"),
            subject: z
                .string()
                .trim()
                .describe("subject of the user who wants to send an email"),
            name: z
                .string()
                .trim()
                .describe("name of the user if provided")
                .nullable(),
            message: z
                .string()
                .trim()
                .describe("message of the user to the email"),
        }),
        description: "tool to email developer about the inquiries",
    },
);

export const sendEmailToUser = tool(
    async ({ email, subject, message }) => {
        const sendEmail = new EmailJS(email);

        sendEmail.setSubject(subject);
        sendEmail.setMessage(message);
        sendEmail.setName("Kenneth Andales Assistant");

        const { status, text } = await sendEmail.sendResponse();

        return `status: ${status}\ntext: ${text}`;
    },
    {
        name: "send_email_back_to_user",
        schema: z.object({
            email: z
                .string()
                .email()
                .describe(
                    "email of a user who make request from receive_email_to_developer tool",
                ),
            subject: z
                .string()
                .trim()
                .describe(
                    "constructed subject to response the inquires/request of the user from receive_email_to_developer tool",
                ),
            message: z
                .string()
                .trim()
                .describe(
                    "constructed message to response the inquires/request of the user from receive_email_to_developer tool",
                ),
        }),
        description:
            "tool to email back who send message to the receive_email_to_developer tool",
    },
);
