# Kinesis Stream Re-creation Guide

Bhai, aapne Kinesis stream delete kar di thi AWS ka bill bachane ke liye.
Jab aapko apna project wapas sir ko dikhana ho, toh bas apne VS Code terminal mein yeh command copy-paste karke Enter maar dena:

```bash
python -c "import boto3; kinesis = boto3.client('kinesis', region_name='us-east-1'); kinesis.create_stream(StreamName='smart-manufacturing-stream', ShardCount=1); print('Stream created successfully!')"
```

Uske baad aapka project pehle jaisa 100% chalne lagega!
