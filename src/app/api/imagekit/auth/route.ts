import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export const dynamic = 'force-static';

export async function GET() {
  try {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      return NextResponse.json({ token: '', expire: 0, signature: '' });
    }
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
    });
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
