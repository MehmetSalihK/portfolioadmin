import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

export const maintenanceSchema = z.object({
  isEnabled: z.boolean(),
  title: z.string().min(1, "Le titre est requis").max(100),
  message: z.string().min(1, "Le message est requis").max(500),
  estimatedEndTime: z.string().optional().or(z.literal('')),
  allowedIPs: z.array(z.string().ip({ message: "Adresse IP invalide" })).optional(),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Email invalide" }),
  subject: z.string().min(1, "Sujet requis"),
  message: z.string().min(1, "Message requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
