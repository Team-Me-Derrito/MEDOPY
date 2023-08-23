from flask import render_template, request, url_for, redirect
from app.projects import bp
from app.models.project import Project
from app.extensions import db

@bp.route('/', methods=('GET', 'POST'))
def index():
    projects = Project.query.all()

    if request.method == 'POST':
        new_project = Project(title=request.form['title'],
                                plan=request.form['plan'],
                                community_id=int(request.form['community_id']))
        db.session.add(new_project)
        db.session.commit()
        return redirect(url_for('projects.index'))

    return render_template('projects/index.html', projects=projects)
