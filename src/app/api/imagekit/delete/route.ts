import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();
    if (!fileId) return NextResponse.json({ error: 'fileId is required' }, { status: 400 });

    await new Promise((resolve, reject) => {
      imagekit.deleteFile(fileId, function(error, result) {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
