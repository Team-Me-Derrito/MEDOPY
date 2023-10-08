from .models import Event, Venue, Project, Account, AccountInterest, Ticket, Community
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json, re

"""
getEventsByAccount()
    Gets all events for a particular accountToken and accountID with the right interestsType
"""
def getInterestEventsByAccount(accountToken, accountID):
    account = Account.objects.get(id=accountID, token=accountToken)
    projects = Project.objects.filter(community=account.community)
    interests = AccountInterest.objects.filter(account=account)

    events = []
    for event in Event.objects.all():
        if (event.project in projects) and (event.interestType in interests):
            struct = {"eventID": event.id, "eventName": event.name}
            events.append(struct)
   
    return events

"""
getInterestEvents()
    Gets all events that match the current account's community and interests.
    Required request data: accountToken + accountID.
"""
@csrf_exempt
def getInterestEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting interest events")

        events = getInterestEventsByAccount(data["token"], data["account_id"])
        return JsonResponse({"events": events})

"""
getEventInfo()
    Gets all necessary event info from the id for the event page.
    Request data: eventID
"""
@csrf_exempt    
def getEventInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting event data")

        event = Event.objects.get(id=data["eventID"])
        struct = {
            "project": event.project.projectName,
            "interestType": event.interestType.interestType,
            "venue": event.venue.locationName,
            "address": event.venue.address,
            "description": event.description,
            "dateAndTime": event.startDateTime,
            "duration": event.duration, 
            "creatorName": event.creator.accountName,
            "creatorEmail": event.creator.email,
            "creatorPhoneNumber": event.creator.phoneNumber
            }

        return JsonResponse(struct)

"""
createToken()
    Used to create a session token.... TODO
"""
def createToken():
    return

"""
createSalt()
    Generates a password salt... TODO
"""
def createSalt():
    return

"""
createAccount()
    Make a new account from sign up info.
    Request data: communityID, accountName, age, gender, phoneNumber, email, password
"""
def createAccount(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")

        community = Community.objects.get(id=data["communityID"])

        newAccount = Account(community=community, 
                             accountName=data["accountName"],
                             age=data["age"],
                             gender=data["gender"],
                             phoneNumber=data["phoneNumber"],
                             email=data["email"],
                             password=data["password"],
                             salt="blah",
                             token=createToken()
                            )
        newAccount.save()
        return HttpResponse("New account has been created")
"""
getAllEvents()
    Returns all the events in the database
"""
@csrf_exempt
def getAllEvents(request):
    events = []
    for event in Event.objects.all():
        events.append({"id": event.id, "name": event.name})
    return JsonResponse({"events": events})

"""
getAllCommuntiyEvents()
    Returns all the events of an account's community.
"""
def getAllCommunityEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        community = account.community
        projects = Project.objects.filter(community=community)
        
        events = []
        for event in Event.objects.all():
            if (event.project in projects):
                events.append({"id": event.id, "name": event.name})

        return JsonResponse({"events": events})
    
"""
getUpcommingEvents()
    Returns all events in the next month.
"""
def getUpcommingEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        community = account.community
        projects = Project.objects.filter(community=community)
        curr_date = datetime.now().date()
        end_date = curr_date + timedelta(days=30)
        upcomming_events = Event.objects.filter(
            startDateTime__date__range=(curr_date, end_date)
        )
        
        events = []
        for event in upcomming_events:
            if (event.project in projects):
                events.append({"id": event.id, "name": event.name})

        return JsonResponse({"events": events})
    
"""
getTicketed()
    Gets all event ids of an accounts upcomming ticketed events.
"""
def getTicketed(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        account_tickets = Ticket.objects.filter(account=account)

        events = []
        for ticket in account_tickets:
            events.append({"id": ticket.event.id, "name": ticket.event.name})

        return JsonResponse({"events": events})
    
def searchEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        community = account.community
        projects = Project.objects.filter(community=community)

        events = []
        for event in Event.objects.all():
            if (event.project in projects) and (re.search(data["query"], event.name)):
                events.append({"id": event.id, "name": event.name})

        return JsonResponse({"events": events})

"""
Get the 20 closest events to the given current_gps.
"""
def getCloseEvents(current_gps):
    events = Event.objects.all()
    event_venues = Venue.objects.all()
    #filter by venues connected to events
    
    gps_distances = []
    for venue in event_venues:
        gps_distances.append((distanceBetween({"longitude":venue.longitude, "latitude":venue.latitue}, current_gps), venue))
    gps_distances = sorted(gps_distances)
    if gps_distances >= 20:
        gps_distances = gps_distances[0:20]

    topResults = {}
    for i, venue in enumerate(gps_distances):
        event = Event.objects.filter(venue=venue)
        topResults[i] = {"name": event.name, "startDate": event.startDateTime, "price": event.price, "interestType": event.interestType.interestType}
    return JsonResponse(topResults)
    

"""
Function to find distance between 2 gps objects.
"""
def distanceBetween(gps1, gps2):
    longitude = gps1["longitude"] - gps2["longitude"]
    latitude = gps1["latitude"] - gps2["latitude"]
    return ((longitude ** 2 + latitude ** 2) ** 0.5)