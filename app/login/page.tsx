'use client';
import Image from "next/image";
import Link from "next/link";
import loginBg from "../../public/media/image/login_bg.jpg";
import { useState } from "react";
import { useCookies } from 'react-cookie';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your password link and a link to sign up if you do not have an account. The second column has a cover image.";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // État pour l'animation de chargement
  const [cookies, setCookie] = useCookies(['token']);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Activer le mode chargement

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_ROUTE + "login_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed: " + await response.text());
      }

      const data = await response.json();
      const token = data.token;
      setCookie('token', token, { path: '/', maxAge: 3600, secure: false, sameSite: 'strict' });
      router.push('/');

    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Désactiver le mode chargement
    }
  };

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
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.fr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading} // Désactiver le champ si en chargement
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-sm underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading} // Désactiver le champ si en chargement
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="loader" /> // Animation de chargement
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Pas encore de compte ?{" "}
            <Link href="#" className="underline">
              Inscription
            </Link>
          </div>
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
