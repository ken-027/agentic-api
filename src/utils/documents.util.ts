import CERTIFICATES from "@/constant/certificates";
import CONTACTS from "@/constant/contacts";
import EXPERIENCES from "@/constant/experiences";
import HOBBIES from "@/constant/hobbies";
import INFO from "@/constant/info";
import PROJECTS from "@/constant/projects";
import SERVICES from "@/constant/services";
import SKILLS from "@/constant/skills";
import { Project } from "@/types";

export const skills = SKILLS.map((skill) => {
    const items = skill.items
        .map((item) => `${item.name} (${item.proficiency})`)
        .join(", ");
    return `${skill.name}: ${items}`;
});

export const projects = Object.keys(PROJECTS).map((name) => {
    //@ts-expect-error @ts-ignore
    const project = PROJECTS[name] as Project;
    const {
        title,
        category,
        description,
        technologies,
        liveDemo,
        githubRepo,
        screenshot,
    } = project;

    const response_technology = technologies.map(({ name }) => name).join(", ");

    const response = `Category: ${category}, Title: ${title}, Description: ${description}, Technologies: ${response_technology}, Live Demo: ${
        liveDemo || ""
    }, Github Repo:${githubRepo || ""}, Screenshots:${screenshot || ""}`;
    return response;
});

export const services = SERVICES.map(
    ({ description, title }) => `Title:${title}, ${description}`,
);

export const experiences = EXPERIENCES.map(
    ({
        company,
        title,
        projects,
        startDate,
        endDate,
        descriptions,
        location,
    }) => {
        const response_project = projects?.map(
            ({
                title,
                category,
                description,
                technologies,
                liveDemo,
                githubRepo,
                screenshot,
            }) => {
                const response_technology = technologies
                    .map(({ name }) => name)
                    .join(", ");

                const response = `Category: ${category}, Title: ${title}, Description: ${description}, Technologies: ${response_technology}, Live Demo: ${
                    liveDemo || ""
                }, Github Repo:${githubRepo || ""}, Screenshots:${screenshot || ""}`;
                return response;
            },
        );

        return `Company: ${company}, Role: ${title}, Date Started: ${startDate}, Date Ended: ${endDate}, Descriptions: ${descriptions.join(
            ", ",
        )}, Location: ${location}, Projects: ${response_project}`;
    },
);

export const certificates = CERTIFICATES.map(
    ({
        dateCompleted,
        skills,
        name,
        certificateLink,
        courseLink,
        provider,
        status,
    }) =>
        `Name: ${name}, skills: ${skills.join(", ")}, Date Completed: ${dateCompleted || ""}, Certificate Link: ${
            certificateLink || ""
        }, Course Link: ${courseLink || ""}, Providers: ${provider}, Status: ${status}`,
);

export const contacts = CONTACTS.map(
    ({ link, name }) => `Name: ${name}, Link: ${link}`,
);

export const hobbies = HOBBIES.map((hobby) => `Hobby: ${hobby}`);

export const infos = INFO.map((info) => `INFO: ${info}`);
