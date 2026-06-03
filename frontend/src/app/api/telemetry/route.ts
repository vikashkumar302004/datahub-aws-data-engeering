import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'smart-mfg-raw-zone-1780521211';

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME
    });
    
    const response = await s3Client.send(command);
    
    const records = [];
    if (response.Contents) {
      // Sort by LastModified descending
      const sortedContents = response.Contents.sort((a, b) => 
        new Date(b.LastModified || 0).getTime() - new Date(a.LastModified || 0).getTime()
      );
      
      // Take top 30 most recent records
      const top30 = sortedContents.slice(0, 30);

      // Fetch all top 30 objects concurrently
      const fetchPromises = top30.map(async (item) => {
        const getCmd = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.Key
        });
        
        try {
          const fileData = await s3Client.send(getCmd);
          if (fileData.Body) {
            const str = await fileData.Body.transformToString();
            const json = JSON.parse(str);
            return {
               ...json,
               time: new Date(item.LastModified || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
          }
        } catch (e) {
          // ignore parsing errors for individual files
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      records.push(...results.filter(r => r !== null));
    }
    
    // Sort by timestamp
    records.sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime());

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error("S3 Telemetry Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
