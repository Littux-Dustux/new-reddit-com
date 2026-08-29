from sqlalchemy import Column, Integer, String, Text, Boolean, Enum, UniqueConstraint, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class Subreddit(Base):
    __tablename__ = "subreddits"

    id = Column(Integer, primary_key=True)
    name = Column(String(21), nullable=False, unique=True)
    name_lower = Column(String(21), nullable=False, unique=True, index=True)
    icon = Column(Text, nullable=True)

    prefs = relationship("SubredditPref", back_populates="subreddit", cascade="all, delete-orphan")


class SubredditPref(Base):
    __tablename__ = 'subreddit_prefs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    sr_id = Column(Integer, ForeignKey('subreddits.id', ondelete='CASCADE'), nullable=False)
    subreddit = relationship("Subreddit", back_populates="prefs")

    sort = Column(
        Enum(
            'best', 'hot', 'new', 'rising', 'gilded',
            'top_hour', 'top_day', 'top_week', 'top_month', 'top_year', 'top_all',
            'controversial_hour', 'controversial_day', 'controversial_week', 'controversial_month', 'controversial_year', 'controversial_all', 
            name='listing_sort'
        ),
        nullable=True
    )
    layout = Column(
        Enum('card', 'classic', 'compact', 'search', name='post_view_layout'),
        nullable=True
    )
    styles_enabled = Column(Boolean, nullable=True)


    __table_args__ = (
        UniqueConstraint('user_id', 'sr_id', name="uq_user_sr_pref"),
    )
    def __repr__(self):
        return f"<SubredditPref(id='{self.id}', sr_id='{self.sr_id}', user_id='{self.user_id}')>"
