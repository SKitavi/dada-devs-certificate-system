import type { Handler } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Import Prisma from backend
const prisma = new PrismaClient();

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Parse request body
    const { email, password } = JSON.parse(event.body || "{}");

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email and password are required" }),
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
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

    // Check if user exists
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Generate access token (7 days)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_Secret_access_token!,
      { expiresIn: "7d" }
    );

    // Generate refresh token (30 days)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_Secret_refresh_token || process.env.JWT_Secret_access_token!,
      { expiresIn: "30d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Login failed",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }),
    };
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
};