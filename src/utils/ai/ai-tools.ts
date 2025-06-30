import { ChatCompletionTool } from "openai/resources/chat";
import EmailJS from "../email-js";
import PushoverNotificationUtil from "../pushover-notification.util";

const getInTouch = async (
    email: string,
    message: string,
    name: string = "Guest",
    subject: string = "Portfolio Chatbot",
) => {
    const ejs = new EmailJS(email);

    ejs.setName(name);
    ejs.setSubject(subject);
    ejs.setMessage(message);

    await ejs.send();
};

const unknownInquiry = async (question: string) => {
    const pushover = new PushoverNotificationUtil();

    return pushover.unknownInquiry(question);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleToolCalls = async (tool_calls: any) => {
    const { name: functionName, arguments: args } = tool_calls;
    const objects = JSON.parse(args);

    const invokeTool = {
        getInTouch: async () => {
            const { email, message, name, subject } = objects;

            await getInTouch(email, message, name, subject);
        },

        unknownInquiry: () => {
            const { question } = objects;

            unknownInquiry(question);
        },
    };

    // @ts-expect-error @ts-ignore
    await invokeTool[functionName]();

    return "notified successfully";
};

export const tools_define: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "getInTouch",
            description:
                "Use this tool to record that a user is interested in being touch and provided an email address",
            parameters: {
                type: "object",
                properties: {
                    email: {
                        type: "string",
                        description: "The user's email address.",
                    },
                    message: {
                        type: "string",
                        description: "The message the user wants to send.",
                    },
                    name: {
                        type: "string",
                        description:
                            "The name of the person sending the message.",
                    },
                    subject: {
                        type: "string",
                        description: "The subject of the email.",
                    },
                },
                required: ["email", "message", "name", "subject"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "unknownInquiry",
            description:
                "Always use this tool to record any question that couldn't answered as you didn't know the answer.",
            parameters: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description:
                            "The unknown question or inquiry from the user.",
                    },
                },
                required: ["question"],
                additionalProperties: false,
            },
        },
    },
];
