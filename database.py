import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="sistema_inventario",
            user="postgres",
            password="chabelo82", # <--- PON LA QUE RECORDAS
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error conectando a PostgreSQL: {e}")
        return None