import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = None #os.environ.get('SECRET_KEY')
    #"postgresql://postgres:1@localhost:5432/test1"
    SQLALCHEMY_DATABASE_URI = app = "postgresql://postgres:1@localhost:5432/test1"
    #os.environ.get('DATABASE_URI')
    #\ or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    
