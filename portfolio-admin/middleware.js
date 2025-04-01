import { NextResponse } from 'next/server';
import dbConnect from './lib/db';

export async function middleware(request) {
    try {
        // Connecter à la base de données (cela déclenchera aussi l'initialisation de l'admin)
        await dbConnect();
    } catch (error) {
        console.error('Middleware error:', error);
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
