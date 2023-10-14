from django.urls import path

from . import views, routes

urlpatterns = [
    path("", views.index, name="index"),
    path("api/events/recommended", routes.getInterestEvents),
    path("api/events/all", routes.getAllEvents),
    path("api/events/upcoming", routes.getUpcommingEvents),
    path("api/events/search", routes.searchEvents),
    path("api/events/community", routes.getAllCommunityEvents),
    path("api/display/community", routes.getCommunityInfo),
    path("api/accounts/create", routes.createAccount)
]
