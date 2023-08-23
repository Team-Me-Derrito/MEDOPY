#App structure based on:
#https://www.digitalocean.com/community/tutorials/how-to-structure-a-large-flask-application-with-flask-blueprints-and-flask-sqlalchemy#prerequisites


from flask import Flask

from config import Config
from app.extensions import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions here
    db.init_app(app)

    # Register blueprints here, blueprints define url request structure: empty / -> main
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)

    from app.communities import bp as communities_bp
    app.register_blueprint(communities_bp, url_prefix='/communities')

    from app.projects import bp as projects_bp
    app.register_blueprint(projects_bp, url_prefix='/projects')

    @app.route('/test/')
    def test_page():
        return '<h1>Testing the Flask Application Factory Pattern</h1>'

    return app