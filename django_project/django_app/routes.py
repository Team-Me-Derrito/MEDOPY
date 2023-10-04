from models import Event, Venue, Project, Account, AccountInterest, Ticket, Community
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def getEventsByAccount(accountToken):
    account = Account.objects.get(token=accountToken)
    projects = Project.objects.filter(community=account.community)
    interests = AccountInterest.objects.filter(account=account)

    events = []
    for event in Event.objects.all():
        if (event.project in projects) and (event.interestType in interests):
            hasTicket = Ticket.objects(account=account, event=event).exists()
            struct = {"eventID": event.id, "eventName": event.name, "hasTicket":hasTicket}
            events.append(struct)
   
    return events

"""
getInterestEvents()
    Gets all events that match the current account's community and interests.
    Request data: accountToken.
"""
@csrf_exempt
def getInterestEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting interest events")

        events = getEventsByAccount(data["accountToken"])
        return JsonResponse(events)

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
createAccount()
    Make a new account from sign up info.
    Request data: communityID, 
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