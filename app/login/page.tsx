'use client';
import Image from "next/image";
import Link from "next/link";
import loginBg from "../../public/media/image/login_bg.jpg";
import { useState } from "react";
import { useCookies } from 'react-cookie';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/schemas/schemas"; // Import du schéma de validation

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['token']);
  const router = useRouter();

  // Formulaire avec validation Zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema), // Utilisation du schéma pour la validation
    defaultValues: {
      email: "",
      password: ""
    },
  });

  // Gestion de la soumission
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}login_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Une erreur est survenue");
      }

      const data = await response.json();
      const token = data.token;

      // Configuration sécurisée du cookie
      setCookie('token', token, {
        path: '/', 
        maxAge: 60000, 
        secure: process.env.NODE_ENV === 'production', // Secure en production uniquement
        sameSite: 'strict',
      });

      router.push('/'); // Redirection après login
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Identifiants incorrects. Veuillez vérifier votre email et votre mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex min-h-full flex-col items-center justify-center py-12">
        <div className="mx-auto grid w-full max-w-md gap-6 px-4 sm:px-0">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Connexion</h1>
            <p className="text-muted-foreground">
              Renseignez votre email et votre mot de passe ci-dessous pour accéder à votre compte
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              {errorMessage && (
                <div className="text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Chargement..." : "Connexion"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src={loginBg}
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
