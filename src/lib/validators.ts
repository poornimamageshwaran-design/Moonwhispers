import { z } from "zod";

export const emailSchema = z.string().email();

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(5000)
});

export const newsletterSchema = z.object({
  email: emailSchema
});

export const commentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(2000)
});

export const adminPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional()
});