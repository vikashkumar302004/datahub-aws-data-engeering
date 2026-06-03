import boto3
import json
import random
import time
import uuid

# Initialize Clients
kinesis = boto3.client('kinesis', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

STREAM_NAME = 'smart-manufacturing-stream'
RAW_BUCKET = 'smart-mfg-raw-zone-1780521211'
QUARANTINE_BUCKET = 'smart-mfg-quarantine-zone-1780521211'

def generate_sensor_data(machine_id):
    is_anomaly = random.random() < 0.2  # 20% chance of anomaly
    
    if is_anomaly:
        temperature = round(random.uniform(101.0, 120.0), 2)
        vibration = round(random.uniform(40.0, 70.0), 2)
        status = "WARNING"
    else:
        temperature = round(random.uniform(60.0, 90.0), 2)
        vibration = round(random.uniform(10.0, 30.0), 2)
        status = "OK"

    data = {
        "event_id": str(uuid.uuid4()),
        "machine_id": machine_id,
        "timestamp": int(time.time()),
        "sensor_readings": {
            "temperature": temperature,
            "vibration": vibration,
            "rpm": random.randint(1400, 1600)
        },
        "status": status
    }
    return data

def run_simulator():
    print(f"Starting IoT Simulator. Sending data to Kinesis and S3...")
    machines = ["Machine-A", "Machine-B", "Machine-C"]
    
    try:
        for i in range(50):
            machine_id = random.choice(machines)
            data = generate_sensor_data(machine_id)
            
            # Send to Kinesis
            try:
                kinesis.put_record(
                    StreamName=STREAM_NAME,
                    Data=json.dumps(data),
                    PartitionKey=machine_id
                )
            except Exception as e:
                print(f"Kinesis Error (ignoring): {e}")
            
            # Simulate Lambda: Send directly to S3
            file_name = f"{machine_id}_{data['event_id']}.json"
            if data['status'] == 'WARNING':
                s3.put_object(Bucket=QUARANTINE_BUCKET, Key=file_name, Body=json.dumps(data))
                print(f"[{i+1}/50] ANOMALY! Sent to Quarantine: {machine_id} ({data['sensor_readings']['temperature']}°C)")
            else:
                s3.put_object(Bucket=RAW_BUCKET, Key=file_name, Body=json.dumps(data))
                print(f"[{i+1}/50] OK. Sent to Raw Zone: {machine_id}")
            
            time.sleep(1)
            
        print("\nSimulator finished! Real AWS Data is now in S3.")
            
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run_simulator()
