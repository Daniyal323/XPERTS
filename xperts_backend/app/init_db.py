from app.db.session import engine, Base
from app.models.models import User, Profile

def init_db():
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()
