import { z } from "zod";

// Schéma de login
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "L'adresse email est invalide" }),
  password: z.string()
});

// Schéma de création d'un utilisateur
const registerSchema = z.object({
  email: z
    .string()
    .email({ message: "L'adresse email est invalide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .max(32, { message: "Le mot de passe ne peut contenir plus de 32 caractères" })
    .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une lettre minuscule" })
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une lettre majuscule" })
    .regex(/[@$!%*?&-_]/, { message: "Le mot de passe doit contenir au moins un caractère spécial" }),
  role: z.enum(["ROLE_TECHNICIEN", "ROLE_ADMIN"]),
});

// Regrouper les schémas dans un objet pour les exporter ensemble
const schemas = {
  login: loginSchema,
  register: registerSchema,
};

// Export des schémas individuellement et regroupés sous un objet
export { loginSchema, registerSchema };
export default schemas;
