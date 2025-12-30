import type { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== "GET") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Get token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "No token provided" }),
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_Secret_access_token!);
    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid or expired token" }),
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        institution: {
          select: {
            id: true,
            slug: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: userWithoutPassword,
      }),
    };
  } catch (error) {
    console.error('Me endpoint error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to get user" }),
    };
  }
};