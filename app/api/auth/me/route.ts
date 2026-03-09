import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('muachung_session')?.value;

        if (!sessionCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(sessionCookie);

        if (!user) {
            // Clear invalid cookie
            const response = NextResponse.json({ error: 'User not found' }, { status: 404 });
            response.cookies.delete('muachung_session');
            return response;
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch user', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST() {
    // Logout route
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('muachung_session');
    return response;
}
