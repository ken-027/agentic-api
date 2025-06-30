import OpenAI from "openai";
import { MongoClient } from "mongodb";
import { MONGODB_URI } from "@/config/env";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default class Embedder {
    static async #generateEmbedding(text: string): Promise<number[]> {
        const res = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });
        return res.data[0].embedding;
    }

    static async cleanVector() {
        const client = await MongoClient.connect(MONGODB_URI, {
            tls: true,
        });
        const collection = client
            .db("portfolio")
            .collection("knowledge_vector");

        await collection.deleteMany();
        console.log("vector document clean");
        await client.close();
    }

    static async saveVectorDoc(contents: string[]) {
        const client = await MongoClient.connect(MONGODB_URI, {
            tls: true,
        });
        const collection = client
            .db("portfolio")
            .collection("knowledge_vector");
        const documents: { content: string; embedding: number[] }[] = [];

        for (const content of contents) {
            try {
                const embedding = await Embedder.#generateEmbedding(content);
                documents.push({ content, embedding });
            } catch (error) {
                console.error("Embedding failed for:", content, error);
            }
        }

        await collection.insertMany(documents);

        console.log("Inserted vector document");
        await client.close();
    }
}
