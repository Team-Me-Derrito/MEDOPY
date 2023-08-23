from abc import ABC, abstractmethod
from flask_sqlalchemy import SQLAlchemy

#Database instance used thoughout project
db = SQLAlchemy()

class EntityBase(db.Model):
    __abstract__ = True
    @abstractmethod
    def save(self):
        pass

    @abstractmethod
    def update(self):
        pass

    @abstractmethod
    def delete(self):
        pass

    @classmethod
    @abstractmethod
    def get(cls, obj_id):
        pass