import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting in memory (for simple trial prevention)
const attempts = new Map<string, { count: number, lockedUntil: number }>();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Simple IP/Identifier tracking (using a static key for simplicity since we don't have easy IP access here)
    const clientIdentifier = "admin_login_attempt"; 
    
    const record = attempts.get(clientIdentifier) || { count: 0, lockedUntil: 0 };
    
    // Check if locked
    if (record.lockedUntil > Date.now()) {
      const waitMinutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${waitMinutes} minute(s).` }, 
        { status: 429 }
      );
    }

    const validUsername = process.env.ADMIN_USERNAME || 'hecentrepreneurs8';
    const validPassword = process.env.ADMIN_PASSWORD || 'bestevent2026';

    if (username === validUsername && password === validPassword) {
      // Success! Clear attempts and set cookie
      attempts.delete(clientIdentifier);
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });

      return NextResponse.json({ success: true });
    } else {
      // Failure
      record.count += 1;
      if (record.count >= 3) {
        record.lockedUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
        record.count = 0; // reset count after lock
      }
      attempts.set(clientIdentifier, record);

      return NextResponse.json(
        { error: 'Identifiants incorrects.' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue.' }, 
      { status: 500 }
    );
  }
}
