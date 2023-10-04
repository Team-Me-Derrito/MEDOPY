from django.urls import path

from . import views, routes

urlpatterns = [
    path("", views.index, name="index"),
    path("api/recommendedEvents", routes.getInterestEvents),
    path("api/allevents", routes.getAllEvents),
    path("api/upcomingevents", routes.getUpcommingEvents),
    path("api/searchevents", routes.searchEvents),
    path("api/communityevents", routes.getAllCommunityEvents)
]
