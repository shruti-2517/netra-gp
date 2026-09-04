import boto3
import logging
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger("S3-Storage")

s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT_URL,
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY
)

def init_s3_bucket():
    try:
        s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
    except ClientError:
        # Bucket does not exist, so we create it
        s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
        logger.info(f"Created S3 Bucket: {settings.S3_BUCKET_NAME}")

def upload_file_to_s3(file_path: str, object_name: str) -> str:
    """Upload a file to an S3 bucket and return public URL (or key)."""
    try:
        s3_client.upload_file(file_path, settings.S3_BUCKET_NAME, object_name)
        url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{object_name}"
        return url
    except ClientError as e:
        logger.error(f"S3 upload error: {e}")
        return ""

def upload_bytes_to_s3(file_bytes: bytes, object_name: str, content_type: str = 'image/jpeg') -> str:
    """Upload raw bytes to S3 and return the public URL (or key)."""
    try:
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=object_name,
            Body=file_bytes,
            ContentType=content_type
        )
        url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{object_name}"
        return url
    except ClientError as e:
        logger.error(f"S3 PutObject error: {e}")
        return ""
