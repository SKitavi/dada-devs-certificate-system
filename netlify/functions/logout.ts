import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // For JWT-based auth, logout is handled client-side by removing tokens
  // This endpoint exists for consistency and can be extended for token blacklisting
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      message: "Logged out successfully" 
    }),
  };
};