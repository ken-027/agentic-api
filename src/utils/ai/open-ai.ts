/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-private-class-members */
import {
    AI_MODEL,
    EMBEDDING_MODEL,
    MONGODB_URI,
    OPENAI_API_KEY,
} from "@/config/env";
import { SessionMessage } from "@/types";
import { AIClass } from "@/types/class";
import { Response } from "express";
import moment from "moment";
import { MongoClient } from "mongodb";
import { OpenAI as OpenAIModule } from "openai";
import {
    ChatCompletionChunk,
    ChatCompletionMessageParam,
} from "openai/resources/chat";
import { Stream } from "openai/streaming";
import { handleToolCalls, tools_define } from "./ai-tools";

const openai = new OpenAIModule({
    apiKey: OPENAI_API_KEY,
});

interface ToolCall {
    id: string;
    type: "function";
    function: {
        name: string;
        arguments: string;
    };
}

export default class OpenAI implements AIClass {
    #completion: Stream<ChatCompletionChunk> | null = null;
    #messages: ChatCompletionMessageParam[] = [];

    async #query(question: string): Promise<string> {
        const embeddingResponse = await openai.embeddings.create({
            input: question,
            model: EMBEDDING_MODEL,
        });
        const queryVector = embeddingResponse.data[0].embedding;

        const client = new MongoClient(MONGODB_URI, {
            tls: true,
        });
        await client.connect();
        const collection = client
            .db("portfolio")
            .collection("knowledge_vector");

        const results = await collection
            .aggregate([
                {
                    $vectorSearch: {
                        queryVector,
                        path: "embedding",
                        numCandidates: 100,
                        limit: 5,
                        index: "vector_knowledge_index",
                    },
                },
            ])
            .toArray();

        await client.close();
        return results.map((doc) => doc.content).join(",");
    }

    async chat(question: string, history: SessionMessage[]) {
        const name = "Kenneth Andales";

        const systemPrompt = `
            You are acting as ${name}. You are answering questions on ${name}'s website, particularly questions related to ${name}'s career, background, skills, and experiences.
            Your responsibility is to represent ${name} for interactions on the website as faithfully as possible.
            You are given a summary of ${name}'s background and LinkedIn profile which you can use to answer questions.
            Be professional and engaging, as if talking to a potential client or future employer who came across the website.
            If you don't know the answer to any question, use your unknownInquiry tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career.
            If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your getInTouch tool.
            With this context, please chat with the user, always staying in character as ${name}.
            please format as markdown and highlight important answer and put some spaces every sentence to make it readable. your computation date will be ${moment()}
        `;

        const context = await this.#query(question);
        const prompts = history.slice(history.length - 3, history.length);

        this.#messages = [
            {
                role: "system",
                content: systemPrompt,
            },
            ...prompts,
            {
                role: "user",
                content: `Context: ${context}, Question: ${question}`,
            },
        ];

        this.#completion = await openai.chat.completions.create({
            model: AI_MODEL,
            tools: tools_define,
            stream: true,
            messages: this.#messages,
        });
    }

    async stream(response: Response) {
        let reply = "";
        const assistantMessage = {
            role: "assistant" as const,
            content: "",
            tool_calls: [] as ToolCall[],
        };

        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.setHeader("Transfer-Encoding", "chunked");

        if (!this.#completion) throw new Error("Completion not found");

        for await (const chunk of this.#completion) {
            const delta = chunk.choices[0]?.delta;
            const finishReason = chunk.choices[0]?.finish_reason;

            if (!delta) continue;

            if (delta.content) {
                response.write(delta.content);
                reply += delta.content;
                assistantMessage.content += delta.content;
            }

            if (delta.tool_calls) {
                for (const toolCallDelta of delta.tool_calls) {
                    const index = toolCallDelta.index;

                    // Initialize new tool call if needed
                    if (!assistantMessage.tool_calls[index]) {
                        assistantMessage.tool_calls[index] = {
                            id: "",
                            type: "function",
                            function: {
                                name: "",
                                arguments: "",
                            },
                        };
                    }

                    const toolCall = assistantMessage.tool_calls[index];

                    // Accumulate tool call data
                    if (toolCallDelta.id) {
                        toolCall.id = toolCallDelta.id;
                    }
                    if (toolCallDelta.function?.name) {
                        toolCall.function.name = toolCallDelta.function.name;
                    }
                    if (toolCallDelta.function?.arguments) {
                        toolCall.function.arguments +=
                            toolCallDelta.function.arguments;
                    }
                }
            }

            if (finishReason === "tool_calls") {
                const toolResults = [];

                for (const toolCall of assistantMessage.tool_calls) {
                    if (toolCall.id && toolCall.function.name) {
                        try {
                            const result = await handleToolCalls(toolCall.function);
                            toolResults.push({
                                role: "tool" as const,
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(result),
                            });
                        } catch (error: any) {
                            toolResults.push({
                                role: "tool" as const,
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    error: error.message,
                                }),
                            });
                        }
                    }
                }

                if (toolResults.length > 0) {
                    const continuationMessages = [
                        ...this.#messages,
                        assistantMessage,
                        ...toolResults,
                    ];

                    const continuationCompletion =
                        await openai.chat.completions.create({
                            model: AI_MODEL,
                            stream: true,
                            messages: continuationMessages,
                        });

                    for await (const contChunk of continuationCompletion) {
                        const contContent =
                            contChunk.choices[0]?.delta?.content;
                        if (contContent) {
                            response.write(contContent);
                            reply += contContent;
                        }
                    }
                }
                break;
            }
        }

        return reply;
    }
}
