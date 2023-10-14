from django.shortcuts import render
from .models import InterestType, Project, Venue, Account, Event

# Create your views here.
def index(request):
    types = InterestType.objects.all()
    projects = Project.objects.all()
    venues = Venue.objects.all()
    accounts = Account.objects.all()
    events = Event.objects.all()
    return render(request, "index.html", {"types":types, "projects":projects, "venues":venues, "accounts":accounts, "events":events})