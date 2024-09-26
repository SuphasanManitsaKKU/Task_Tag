'use client';

import UserVideosPage from '../../components/Background/uploadmybackground.js'; // Import the UserVideosPage component
export default function Explore({ params }) {
    const { userId } = params; // Get userId from params
    console.log("---------------------------------");
    console.log("Explore page", userId);
    console.log("---------------------------------");


    return (
        <div className="min-h-screen flex flex-col">
            <UserVideosPage params={ userId } />
        </div>
    );
}
