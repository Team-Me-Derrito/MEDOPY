from .models import Event, Venue, Project, Account, AccountInterest, Ticket, Community, DiscussionPost
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json, re
from . import queries, security

"""
getInterestEvents()
    Gets all events that match the current account's community and interests.
    Required request data: token + account_id.
"""
@csrf_exempt
def getInterestEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting interest events")

        events = queries.getInterestEventsByAccount(data["token"], data["account_id"])
        return JsonResponse({"events": events})

"""
getEventInfo()
    Gets all necessary event info from the id for the event page.
    Request data: event_id
"""
@csrf_exempt    
def getEventInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting event data")

        event = Event.objects.get(id=data["event_id"])
        struct = {
            "project": event.project.projectName,
            "eventName": event.name,
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
                             token=security.generateToken()
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
        events.append({"eventID": event.id, "eventName": event.name, "description": event.description, "venue": event.venue.locationName})
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
        
        events = queries.getEventsByCommunty(community.id)

        return JsonResponse({"events": events})

"""
getAllCommunityEventsDisplay()
    Request: community_id
"""    
def getAllCommunityEventsDisplay(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        events = queries.getEventsByCommunty(data["community_id"])
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
        community_id = account.community.id
        events = queries.getNextMonthCommunityEvents(community_id)
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
        events = queries.getTicketedEvents(account)

        return JsonResponse({"events": events})
    
"""
getDiscussionPosts()
    Gets all the discussion posts for the users community
"""
def getDiscussionPosts(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        community = account.community

        posts = []
        for post in DiscussionPost.objects.filter(community=community):
            posts.append({"accountName": post.account.accountName, "timestamp":post.timestamp, "text":post.text})

        return JsonResponse({"posts": posts})
    
"""
newDiscussionPost()
    User can create a new post one the discussion board
"""
def newDiscussionPost(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(id=data["account_id"], token=data["token"])
        community = account.community

        post = DiscussionPost(
            community=community,
            account=account,
            timestamp=datetime.now(),
            text=data["post_text"]
            )
        post.save()
    
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

"""
getCommunityInfo()
    request: data["community_id]
"""
def getCommunityInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(id=data["community_id"])

        community_info = {"community_name": community.communityName} #TODO coordinate
        return JsonResponse(community_info)
    

"""
getProjectsInCommunity()
    request: data["community_id"]
"""
def getProjectsInCommunity(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(id=data["community_id"])

        projects = []
        for project in Project.objects.all():
            if project.community == community:
                project_stuct = {
                    "project_id": project.id,
                    "project_name": project.projectName,
                    "project_description": project.description,
                    "project_start": project.startDate,
                    "project_end": project.endDate
                }
        return JsonResponse(projects)
    
"""
getCommunityInterests()
    request: data["community_id"]
"""
def getCommunityInterests(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(id=data["community_id"])

        communityInterests = {}
        for accountInterest in AccountInterest.objects.all():
            if accountInterest.account.community == community:
                if accountInterest in communityInterests:
                    communityInterests[accountInterest] += 1
                else:
                    communityInterests[accountInterest] = 1

        return JsonResponse(communityInterests)
    
"""
getCommunityPosts()
    request: data["community_id"]
    returns the last 50 posts
"""
def getCommunityPosts(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(id=data["community_id"])

        posts = []
        for post in DiscussionPost.objects.all():
            if post.account.community == community:
                posts.append({
                    "poster_account": post.account.accountName,
                    "post_timestamp": post.timestamp,
                    "post": post.text
                })

        return JsonResponse(posts[-50])
    
"""
login()
    request: data["email", "password"]

    return:
    {
        success: true/false,
        account_id: id,
        token: token
    }
"""
def login(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        password_hashed = security.hash(data["password"], queries.getSalt(data["username"]))
        response = queries.verify(data["email"], password_hashed)

        if response["token"] is not None:
            login = {"sucess": True, "account_id": response["account_id"], "token": response["token"]}
        else:
            login = {"success": False}
    return login


"""
createPost()
    request: data["account_id", "token", "message"]
"""
def createPost(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        result = queries.createPost(data["account_id"], data["token"], data["message"])
        return JsonResponse(result)


# join event

# get account info
"""
getAccountInfo()
    request: data["account_id", "token"]
"""
def getAccountInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        result = queries.getAccountInfo(data["account_id"], data["token"])
        return JsonResponse(result)
    
"""
joinEvent()
    request: data["account_id", "token", "event_id"]
"""
def joinEvent(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        result = queries.joinEvent(data["account_id"], data["token"], data["event_id"])
        return JsonResponse(result)