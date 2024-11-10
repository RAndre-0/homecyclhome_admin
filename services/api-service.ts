import { getCookie } from 'cookies-next';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  body?: any;
}

export const apiService = async (endpoint: string, method: HttpMethod, body?: any) => {
  try {
    const token = getCookie('token') as string | undefined;

    if (!token) {
      throw new Error("Token is missing from cookies");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // Récupère le message d'erreur pour faciliter le débogage
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    // Vérifier si la réponse contient du JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Retourne null si aucune donnée JSON n'est présente
    return null;

  } catch (error) {
    console.error("API Service Error:", error);
    throw error;
  }
};
