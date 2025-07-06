import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import * as cheerio from "cheerio";

export const getWebsiteContent = tool(
    async ({ url }) => {
        const res = await axios.get(url);
        const html = res.data;
        const $ = cheerio.load(html);
        const text = $("body").text();

        return `HTML: ${res.data}\nPlain Text: ${text.slice(0, 8000)}\nResponse Headers: ${JSON.stringify(res.headers)}`;
    },
    {
        name: "fetch_html_content",
        schema: z.object({
            url: z.string().trim().url().describe("url link of the website"),
        }),
        description: "tool to fetch html content of a website",
    },
);
