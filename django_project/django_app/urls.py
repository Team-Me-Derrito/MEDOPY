from django.urls import path

from . import views, routes

urlpatterns = [
    path("", views.index, name="index"),
    #accounts
    path("api/accounts/create", routes.createAccount),
    path("api/accounts/post", routes.createPost),
    path("api/accounts/fetch", routes.getAccountInfo),
    path("api/accounts/login", routes.login),

    #events
    path("api/events/recommended", routes.getInterestEvents),
    path("api/events/all", routes.getAllEvents),
    path("api/events/upcoming", routes.getUpcommingEvents),
    path("api/events/search", routes.searchEvents),
    path("api/events/community", routes.getAllCommunityEvents),
    path("api/events/event_id", routes.getEventInfo),
    path("api/events/event_ticket", routes.getEventInfo),
    path("api/events/create", routes.createEvent), #check url
    path("api/events/attendance/get", routes.getAttendance),
    path("api/events/attendance/set", routes.setAttendance),
    path("api/events/delete", routes.deleteEvent),

    #community
    path("api/community/posts", routes.getDiscussionPosts),
    path("api/community/fetch", routes.getCommunities),

    #fetching
    path("api/venues/fetch", routes.getVenues),
    path("api/interests/fetch", routes.getInterestTypes),
    path("api/projects/fetch", routes.getProjects),
    
    
    #display
    path("api/display/communities", routes.getCommunities),
    path("api/display/info", routes.getCommunityInfo),
    
    path("api/display/projects", routes.getProjectsInCommunity),
    path("api/display/events", routes.getAllCommunityEventsDisplay),

    path("api/display/posts", routes.getCommunityPosts),
    path("api/display/interests", routes.getCommunityInterests),
    
    
    
]
