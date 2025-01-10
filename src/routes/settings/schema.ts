import { z } from "zod";

export const schema = z.object({
 url: z.string().url(),
});

export type FormSchema = typeof schema;
