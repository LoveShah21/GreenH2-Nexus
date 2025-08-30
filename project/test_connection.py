import psycopg2
from psycopg2 import sql

def test_connection():
    try:
        # Connect to database
        conn = psycopg2.connect(
            host="localhost",
            database="green_hydrogen_db",
            user="hydro_user",
            password="hydrogen123",
            port="5432"
        )
        
        # Test queries
        cursor = conn.cursor()
        
        # Test SELECT
        cursor.execute("SELECT COUNT(*) FROM renewable_plants;")
        count = cursor.fetchone()
        print(f"✓ SELECT works: {count[0]} rows in renewable_plants")
        
        # Test INSERT
        cursor.execute("""
            INSERT INTO renewable_plants (plant_type, capacity_mw, lat, lng) 
            VALUES ('test_solar', 99.9, 34.0, -118.0)
            RETURNING id;
        """)
        new_id = cursor.fetchone()[0]
        print(f"✓ INSERT works: New record ID = {new_id}")
        
        # Test UPDATE
        cursor.execute("UPDATE renewable_plants SET capacity_mw = 100.0 WHERE id = %s;", (new_id,))
        print("✓ UPDATE works")
        
        # Test DELETE
        cursor.execute("DELETE FROM renewable_plants WHERE id = %s;", (new_id,))
        print("✓ DELETE works")
        
        # Commit and close
        conn.commit()
        cursor.close()
        conn.close()
        
        print("🎉 All tests passed! Connection is working perfectly.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_connection()