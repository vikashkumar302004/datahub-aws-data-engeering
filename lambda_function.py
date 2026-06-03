import json
import base64
import boto3
import os

s3 = boto3.client('s3')
RAW_BUCKET = os.environ.get('RAW_BUCKET')
QUARANTINE_BUCKET = os.environ.get('QUARANTINE_BUCKET')

def lambda_handler(event, context):
    print(f"Received {len(event['Records'])} records from Kinesis")
    
    for record in event['Records']:
        # Kinesis data is base64 encoded
        payload = base64.b64decode(record['kinesis']['data']).decode('utf-8')
        data = json.loads(payload)
        
        event_id = data.get('event_id', 'unknown')
        machine_id = data.get('machine_id', 'unknown')
        
        # --- DATA QUALITY CHECK ---
        # If status is WARNING or temperature > 100, we send it to Quarantine
        # Otherwise, it's valid and goes to Raw Zone
        
        is_valid = True
        if data.get('status') == 'WARNING' or data['sensor_readings']['temperature'] > 100:
            is_valid = False
            
        file_name = f"{machine_id}/{event_id}.json"
        
        if is_valid:
            print(f"Valid Data: Moving to Raw Zone ({file_name})")
            s3.put_object(
                Bucket=RAW_BUCKET,
                Key=file_name,
                Body=json.dumps(data)
            )
        else:
            print(f"Invalid/Faulty Data: Moving to Quarantine Zone ({file_name})")
            # In a real scenario, we might also trigger an SNS Alert here!
            s3.put_object(
                Bucket=QUARANTINE_BUCKET,
                Key=file_name,
                Body=json.dumps(data)
            )
            
    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete')
    }
