'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';

export default function Logout() {
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token';
  const [, , removeCookie] = useCookies([TOKEN_NAME]);
  const router = useRouter();

  useEffect(() => {
    removeCookie(TOKEN_NAME, { path: '/' });
    router.push('/login');
  }, [removeCookie, router, TOKEN_NAME]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Déconnexion en cours...</p>
    </div>
  );
}
