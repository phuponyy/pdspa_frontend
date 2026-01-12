import { z } from "zod";

export const leadItemSchema = z.object({
  serviceId: z.number().min(1),
  priceOptionId: z.number().min(1),
  qty: z.number().min(1),
});

export const leadSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
  langCode: z.string().min(2),
  items: z.array(leadItemSchema).min(1, "Select at least one service"),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
