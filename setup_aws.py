import boto3
import json
import time

def setup_infrastructure():
    print("Initializing AWS Setup...")
    
    # Kinesis Client
    kinesis = boto3.client('kinesis', region_name='us-east-1')
    
    # S3 Client
    s3 = boto3.client('s3', region_name='us-east-1')
    
    # 1. Create Kinesis Stream
    stream_name = 'smart-manufacturing-stream'
    try:
        print(f"Creating Kinesis Stream: {stream_name}...")
        kinesis.create_stream(StreamName=stream_name, ShardCount=1)
        print("Waiting for stream to become active (takes a few seconds)...")
        time.sleep(20)
        print("Kinesis Stream created successfully!")
    except kinesis.exceptions.ResourceInUseException:
        print(f"Stream {stream_name} already exists.")
        
    # 2. Create S3 Buckets (Raw & Quarantine)
    # AWS S3 bucket names must be globally unique, so we add a timestamp suffix
    timestamp = int(time.time())
    raw_bucket_name = f"smart-mfg-raw-zone-{timestamp}"
    quarantine_bucket_name = f"smart-mfg-quarantine-zone-{timestamp}"
    
    print(f"\nCreating S3 Buckets...")
    try:
        s3.create_bucket(Bucket=raw_bucket_name)
        print(f"Created Raw Bucket: {raw_bucket_name}")
        
        s3.create_bucket(Bucket=quarantine_bucket_name)
        print(f"Created Quarantine Bucket: {quarantine_bucket_name}")
    except Exception as e:
        print(f"Error creating buckets: {e}")
        
    print("\n--- Setup Complete ---")
    print("These are your important Resource Names, keep them safe:")
    print(f"Kinesis Stream: {stream_name}")
    print(f"Raw S3 Bucket: {raw_bucket_name}")
    print(f"Quarantine S3 Bucket: {quarantine_bucket_name}")

if __name__ == "__main__":
    setup_infrastructure()
