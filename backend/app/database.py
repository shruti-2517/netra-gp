import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger("Database")

DATABASE_URL = settings.DATABASE_URL
logger.info(f"Connecting to PostgreSQL database at {DATABASE_URL}...")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Verify connection
    with engine.connect() as conn:
        logger.info("Successfully established connection to PostgreSQL database (gujarat_cctv_db).")
except Exception as e:
    logger.error(f"Failed to connect to PostgreSQL database: {e}")
    logger.error("Please ensure PostgreSQL is running and run 'python setup_postgres.py' in backend directory.")
    raise ConnectionError(f"PostgreSQL connection failed: {e}") from e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
