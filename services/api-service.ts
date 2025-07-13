import { getCookie } from 'cookies-next';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method: HttpMethod;
  body?: any;
}

export const convertKeysToCamel = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(convertKeysToCamel);
  } else if (input && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = convertKeysToCamel(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return input;
};

export const apiService = async (endpoint: string, method: HttpMethod, body?: any) => {
  try {
    const token = getCookie('token') as string | undefined;

    if (!token) {
      throw new Error("Token is missing from cookies");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const rawData = await response.json();
      return convertKeysToCamel(rawData); // Conversion en camel case
    }

    // Pour les cas comme des blobs ou du texte
    return null;

  } catch (error) {
    console.error("API Service Error:", error);
    throw error;
  }
};

export const convertKeysToSnake = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(convertKeysToSnake);
  } else if (input && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = convertKeysToSnake(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return input;
};
