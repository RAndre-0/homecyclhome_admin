'use client';
import Image from "next/image";
import loginBg from "../../public/media/image/login_bg.jpg";
import { useState } from "react";
import { useCookies } from 'react-cookie';
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/schemas/schemas";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token';
  const [, setCookie] = useCookies([TOKEN_NAME]); // ignore the 'cookies' value
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

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

      setCookie(TOKEN_NAME, token, {
        path: '/',
        maxAge: 3600,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      router.push('/');
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
