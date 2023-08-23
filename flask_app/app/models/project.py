from app.extensions import db

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text)
    plan = db.Column(db.Text)
    community_id = db.Column(db.Integer, db.ForeignKey('community.id'))

    def __repr__(self):
        return f'<Project {self.plan}>'