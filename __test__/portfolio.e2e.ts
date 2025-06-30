import request from "supertest";
import { Express } from "express";
import createApp from "../src/app";

describe("agentic api endpoints", () => {
    let app: Express;

    beforeAll(() => {
        app = createApp;
    });

    it("should return list of agents", async () => {
        const res = await request(app).get("/api/v1/agents").expect(200);

        expect(res.body.agents.length).toBeGreaterThan(0);
        expect(Object.keys(res.body.agents[0]).sort()).toEqual([
            "description",
            "name",
        ]);
    });

    it("return 400 for missing message on chat", async () => {
        await request(app).post("/api/v1/agents/portfolio").expect(400);
    });

    it("chat portfolio agent", async () => {
        await request(app)
            .post("/api/v1/agents/portfolio")
            .send({ message: "Hi there!" })
            .expect(200);
    });
});
