import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'smart-mfg-quarantine-zone-1780521211';

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    
    const records = [];
    if (response.Contents) {
      // Sort by LastModified descending
      const sortedContents = response.Contents.sort((a, b) => 
        new Date(b.LastModified || 0).getTime() - new Date(a.LastModified || 0).getTime()
      );

      // Fetch full object content for preview
      const fetchPromises = sortedContents.map(async (item) => {
        const getCmd = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.Key
        });
        let details = null;
        try {
          const fileData = await s3Client.send(getCmd);
          if (fileData.Body) {
            const str = await fileData.Body.transformToString();
            details = JSON.parse(str);
          }
        } catch(e) {}
        
        return {
          id: item.Key,
          machine: item.Key?.split('_')[0] || 'Unknown',
          timestamp: item.LastModified,
          details
        };
      });

      const results = await Promise.all(fetchPromises);
      records.push(...results);
    }
    
    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error("S3 Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    
    return NextResponse.json({ success: true, message: `Deleted ${key}` });
  } catch (error: any) {
    console.error("S3 Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
