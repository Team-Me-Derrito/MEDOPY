from app.extensions import db

class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    description = db.Column(db.Text)
    
    projects = db.relationship('Project', backref='community')


    def __repr__(self):
        return f'<Post "{self.name}">'


