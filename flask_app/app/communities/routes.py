from flask import render_template, jsonify
from app.communities import bp
from app.extensions import db
from app.models.community import Community
from app.models.project import Project
from sqlalchemy import select


@bp.route('/')
def index():
    communities = Community.query.all()
    return render_template('communities/index.html', communities=communities)

@bp.route('/projects/')
def projects():
    return render_template('communities/projects.html')

@bp.route('/raw/')
def raw():
    communities = Community.query.all() # Retrieve all user records
    community_data = [{'id': community.id, 'username': community.name} for community in communities]
    return jsonify(community_data)

@bp.route('/<int:comm_id>', methods=['GET'])
def get_user(comm_id):
    print("HEre")
    community = Community.query.get(comm_id)
    projects = Project.query.filter(Project.community_id == comm_id).all()
    print(community)
    print(projects)
    community_projects = [{'id': community.id, 'title': project.title, 'plan': project.plan} for project in projects]
    return jsonify(community_projects)
    #return render_template('communities/communitydeet.html', projects=projects, community=community)