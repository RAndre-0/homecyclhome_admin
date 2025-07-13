"use client";

import { apiService, convertKeysToSnake } from "@/services/api-service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/schemas/schemas";

export default function CreateUser() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            roles: [],
            firstName: "",
            lastName: "",
        },
    });

    // Gestionnaire de soumission
    async function onSubmit(values: z.infer<typeof registerSchema>) {
        console.log("Payload envoyé :", values);
        setLoading(true);
        try {
            await apiService(`users`, "POST", convertKeysToSnake(values));
            toast({
                title: "Utilisateur créé avec succès",
                description: "Un utilisateur a bien été ajouté à l'application.",
                variant: "default",
            });
            router.push("/dashboard/utilisateurs");
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création de l'utilisateur.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-start justify-center">
            <div className="max-w-md w-full p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-bold mb-4">Nouvel utilisateur</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Prénom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="exemple@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mot de passe</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Mot de passe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="roles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rôle</FormLabel>
                                    <Select
  onValueChange={(value) => field.onChange(value === "none" ? [] : [value])}
  defaultValue={field.value[0] || ""}
>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisissez un rôle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="none">Choisissez un rôle</SelectItem>
                                            <SelectItem value="ROLE_TECHNICIEN">Technicien</SelectItem>
                                            <SelectItem value="ROLE_ADMIN">Administrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Chargement..." : "Confirmer"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
