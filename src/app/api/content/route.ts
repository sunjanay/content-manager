import { put, head } from '@vercel/blob';
import { NextResponse } from 'next/server';

const BLOB_PATH = 'content-data.json';

// GET - Retrieve all content data
export async function GET() {
  try {
    // Check if blob store is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ state: null }, { status: 200 });
    }

    // Try to get metadata about the blob
    const blobMeta = await head(BLOB_PATH).catch(() => null);

    if (!blobMeta) {
      return NextResponse.json({ state: null }, { status: 200 });
    }

    // Fetch the actual content
    const response = await fetch(blobMeta.url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ state: null }, { status: 200 });
  }
}

// POST - Save all content data
export async function POST(request: Request) {
  try {
    // Check if blob store is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate the data structure
    if (!body.state || !body.state.content) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Upload to blob storage
    await put(BLOB_PATH, JSON.stringify(body), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
