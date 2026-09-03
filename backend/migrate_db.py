"""
Database Migration script to ensure Phase 2 columns and EvidenceCertificate tables exist.
"""
from sqlalchemy import text
from app.database import engine, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DB-Migration")

def run_migration():
    logger.info("Checking and applying Phase 2 database schema updates...")
    
    # 1. Create any missing tables (e.g. evidence_certificates)
    Base.metadata.create_all(bind=engine)
    
    # 2. Add Phase 2 columns to detection_events table if missing
    columns_to_add = [
        ("vehicle_color", "VARCHAR(50) DEFAULT 'UNKNOWN'"),
        ("vehicle_type", "VARCHAR(50) DEFAULT 'VEHICLE'"),
        ("speed_kmh", "FLOAT NULL"),
        ("is_speed_violation", "BOOLEAN DEFAULT FALSE"),
        ("evidence_hash", "VARCHAR(64) NULL")
    ]
    
    with engine.connect() as conn:
        for col_name, col_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE detection_events ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                conn.commit()
                logger.info(f"Added column [{col_name}] to detection_events table.")
            except Exception as e:
                logger.info(f"Column [{col_name}] status check: {e}")
                
    logger.info("Phase 2 database schema is fully synchronized.")

if __name__ == "__main__":
    run_migration()
