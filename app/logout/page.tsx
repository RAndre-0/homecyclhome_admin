'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Utilisation du router pour redirection
import { useCookies } from 'react-cookie';

export default function Logout() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']); // Accès aux cookies
  const router = useRouter(); // Pour la redirection

  useEffect(() => {
    // Suppression du cookie contenant le token
    removeCookie('token', { path: '/' });
    // Redirection vers la page de login
    router.push('/login');
  }, [removeCookie, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Déconnexion en cours...</p>
    </div>
  );
}
