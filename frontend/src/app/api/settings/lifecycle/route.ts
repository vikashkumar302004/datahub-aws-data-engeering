import { NextResponse } from 'next/server';
import { S3Client, PutBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'smart-mfg-raw-zone-1780521211';

export async function POST(request: Request) {
  try {
    const { days } = await request.json();

    if (!days || isNaN(days)) {
      return NextResponse.json({ success: false, error: 'Invalid days provided' }, { status: 400 });
    }

    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: BUCKET_NAME,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "ArchiveOldTelemetryToGlacier",
            Filter: { Prefix: "" },
            Status: "Enabled",
            Transitions: [
              {
                Days: parseInt(days, 10),
                StorageClass: "GLACIER"
              }
            ]
          }
        ]
      }
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, message: `Lifecycle policy applied: Archive after ${days} days` });
  } catch (error: any) {
    console.error("Failed to update lifecycle policy:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
