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
});
