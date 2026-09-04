import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "NETRA-GP: Gujarat Police Video Management & ANPR Platform"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://cctv_admin:cctv_password123@localhost:5432/gujarat_cctv_db"
    )
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-gujarat-police-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Sentinel Grid Access Credentials
    SENTINEL_EMAIL: str = os.getenv("SENTINEL_EMAIL", "")
    SENTINEL_PASS: str = os.getenv("SENTINEL_PASS", "")
    SENTINEL_HOST: str = os.getenv("SENTINEL_HOST", "https://cctv.corp8.cloud")

    class Config:
        case_sensitive = True

settings = Settings()
