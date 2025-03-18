// Default to localhost for local development
export const API_URL = 
  typeof window === 'undefined' 
    ? process.env.API_URL || 'http://api:8080'  // Server-side (use Docker service name)
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5115'; // Client-side
