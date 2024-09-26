import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Define the type for the decoded JWT
interface DecodedToken {
    userId?: number;
    [key: string]: any; // To handle any other properties
}

// Define the secret key for JWT verification
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET ?? ''; // Replace with your actual secret key or provide a default value

// Define the GET function
export async function GET() {
    // Retrieve the cookie
    const cookie = cookies().get('token');
    const token = cookie ? cookie.value : null;

    console.log('sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
    if (token) {
        try {
            // Verify and decode the JWT token
            const decoded = jwt.verify(token, JWT_SECRET || '') as DecodedToken;
            const userId = decoded.userId ? decoded.userId : null;
            const videoId = decoded.videoId ? decoded.videoId : null;
            console.log('jkjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', userId, videoId);

            // Return the user ID in the response
            return new Response(JSON.stringify({ userId, videoId }), { status: 200 });
        } catch (error) {
            console.log('oooooooooooooooooooooooooooo');

            console.error('Token verification failed:', error);
            return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400 });
        }
    } else {
        console.log('ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg');
        return new Response(JSON.stringify({ error: 'Token not found' }), { status: 404 });
    }
}
