"""
NETRA-GP: Automated PostgreSQL Database & User Setup Script
Creates the `gujarat_cctv_db` database and `cctv_admin` user automatically.

Usage:
    python setup_postgres.py
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def setup_postgres(host="localhost", port=5432, admin_user="postgres", admin_password="postgres"):
    try:
        conn = psycopg2.connect(host=host, port=port, user=admin_user, password=admin_password, dbname="postgres")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        print(f"Connected to PostgreSQL server at {host}:{port} as admin '{admin_user}'.")

        # Create database gujarat_cctv_db if it does not exist
        cur.execute("SELECT datname FROM pg_database WHERE datname='gujarat_cctv_db';")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE gujarat_cctv_db;")
            print("[SUCCESS] Created database: gujarat_cctv_db")
        else:
            print("[INFO] Database gujarat_cctv_db already exists.")

        # Create role cctv_admin if it does not exist
        cur.execute("SELECT 1 FROM pg_roles WHERE rolname='cctv_admin';")
        if not cur.fetchone():
            cur.execute("CREATE USER cctv_admin WITH PASSWORD 'cctv_password123';")
            print("[SUCCESS] Created role/user: cctv_admin")
        else:
            cur.execute("ALTER USER cctv_admin WITH PASSWORD 'cctv_password123';")
            print("[INFO] Updated user password for cctv_admin.")

        cur.execute("GRANT ALL PRIVILEGES ON DATABASE gujarat_cctv_db TO cctv_admin;")
        cur.execute("ALTER DATABASE gujarat_cctv_db OWNER TO cctv_admin;")
        print("[SUCCESS] Granted all privileges on gujarat_cctv_db to cctv_admin.")
        
        cur.close()
        conn.close()
        print("\n[COMPLETE] PostgreSQL Database Infrastructure Setup Complete!")
        print("   Database URL: postgresql://cctv_admin:cctv_password123@localhost:5432/gujarat_cctv_db")
        return True
    except Exception as e:
        print(f"[ERROR] Error setting up PostgreSQL database: {e}")
        print("   Please ensure PostgreSQL service is running on port 5432.")
        return False

if __name__ == "__main__":
    setup_postgres()
