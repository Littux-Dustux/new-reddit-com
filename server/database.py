from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

engine = create_engine("sqlite:///data.db", echo=False)
Base = declarative_base()
db = scoped_session(sessionmaker(bind=engine))