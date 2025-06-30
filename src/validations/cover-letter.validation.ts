import * as z from "zod/v4";

export const CoverLetter = z.object({
    company: z.string().trim().max(100).min(1),
    background: z.string().trim().max(1000).min(1).optional().nullable(),
    job_description: z.string().trim().max(3000).min(1),
});

export type CoverLetter = z.infer<typeof CoverLetter>;
