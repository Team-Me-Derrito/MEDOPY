from .models import Event, Venue, Project, Account, AccountInterest, Ticket, Community, DiscussionPost, InterestType
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

        events = queries.getInterestEventsByAccount(data["Token"], data["account_id"])
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

        event = Event.objects.get(pk=data["event_id"])
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
createAccount()
    Make a new account from sign up info.
    Request data: communityID, accountName, age, gender, phoneNumber, email, password
"""
@csrf_exempt
def createAccount(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("create account daata is ", data)
        community = Community.objects.get(pk=data["community_id"])
        token = security.generateKey()
        salt = security.generateKey(length=20)
        password = data["Password"]
        password = security.hash(password, salt)
        newAccount = Account(community=community,
                             accountName=data["AccountName"],
                             birthday=data["Birthday"],
                             gender=data["Gender"],
                             phoneNumber=data["PhoneNumber"],
                             email=data["Email"],
                             password=password,
                             salt=salt,
                             token=token
                            )
        newAccount.save()

        for interest in data["interestTypes"]:
            interestObj = InterestType.objects.get(pk=interest)
            accountInterest = AccountInterest(account=newAccount, interestType=interestObj)
            accountInterest.save()

        return JsonResponse({"account_id": newAccount.pk, "token": token, "success": True})
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
@csrf_exempt
def getAllCommunityEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(pk=data["account_id"], token=data["Token"])
        community = account.community
        
        events = queries.getEventsByCommunty(community.id)

        return JsonResponse({"events": events})

"""
getAllCommunityEventsDisplay()
    Request: community_id
""" 
@csrf_exempt   
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
@csrf_exempt
def getUpcommingEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(pk=data["account_id"], token=data["Token"])
        community_id = account.community.id
        events = queries.getNextMonthCommunityEvents(community_id)
        return JsonResponse({"events": events})
    
"""
getTicketed()
    Gets all event ids of an accounts upcomming ticketed events.
"""
@csrf_exempt
def getTicketed(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(pk=data["account_id"], token=data["token"])
        events = queries.getTicketedEvents(account)

        return JsonResponse({"events": events})
    
"""
getDiscussionPosts()
    Gets all the discussion posts for the users community
"""
@csrf_exempt
def getDiscussionPosts(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("communits posts data is", data)
        #account = Account.objects.get(pk=data["account_id"], token=data["Token"])
        #community = account.community

        communityid = Community.objects.get(pk=2)
        posts = []
        for post in DiscussionPost.objects.filter(community=communityid):
            posts.append({"accountName": post.account.accountName, "timestamp":post.timestamp, "text":post.text})
        # for post in DiscussionPost.objects.all():
        #     posts.append({"accountName": post.account.accountName, "timestamp":post.timestamp, "text":post.text})

        return JsonResponse({"posts": posts})
    
"""
newDiscussionPost()
    User can create a new post one the discussion board
"""
@csrf_exempt
def newDiscussionPost(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(pk=data["account_id"], token=data["token"])
        community = account.community

        post = DiscussionPost(
            community=community,
            account=account,
            timestamp=datetime.now(),
            text=data["post_text"]
            )
        post.save()

@csrf_exempt  
def searchEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        account = Account.objects.get(pk=data["account_id"], token=data["Token"])
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
@csrf_exempt
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
@csrf_exempt
def distanceBetween(gps1, gps2):
    longitude = gps1["longitude"] - gps2["longitude"]
    latitude = gps1["latitude"] - gps2["latitude"]
    return ((longitude ** 2 + latitude ** 2) ** 0.5)

"""
getCommunityInfo()
    request: data["community_id]
"""
@csrf_exempt
def getCommunityInfo(request):
    if request.method == "POST":
        print("body is ", request.body)
        data = request.body.decode("utf-8")
        print("getcommunity data ", data)
        data = json.loads(data)

        community = Community.objects.get(pk=data["community_id"])

        account_scores = []
        for account in Account.objects.filter(community=community):
            score = queries.getUserScore(account)
            account_scores.append(score)

        community_info = {
            "community_name": community.communityName, 
            "community_id": community.pk, 
            "scores": account_scores
            }
        return JsonResponse(community_info)
    

"""
getProjectsInCommunity()
    request: data["community_id"]
"""
@csrf_exempt
def getProjectsInCommunity(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(pk=data["community_id"])

        projects = []
        for project in Project.objects.all():
            if project.community == community:
                project_stuct = {
                    "id" : project.pk,
                    "project_id": project.pk,
                    "project_name": project.projectName,
                    "project_description": project.description,
                    "project_start": project.startDate,
                    "project_end": project.endDate
                }
                projects.append(project_stuct)
        return JsonResponse({"projects": projects})
    
"""
getCommunityInterests()
    request: data["community_id"]
"""
@csrf_exempt
def getCommunityInterests(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(pk=data["community_id"])

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
@csrf_exempt
def getCommunityPosts(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        community = Community.objects.get(pk=data["community_id"])

        posts = []
        for post in DiscussionPost.objects.all():
            if post.account.community == community:
                posts.append({
                    "poster_account": post.account.accountName,
                    "post_timestamp": post.timestamp,
                    "post": post.text
                })

        return JsonResponse({"posts": posts})
    
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
@csrf_exempt
def login(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        salt = queries.getSalt(data["Email"])
        if salt is not None:
            password_hashed = security.hash(data["Password"], queries.getSalt(data["Email"]))
            response = queries.verify(data["Email"], password_hashed)
        else:
            return JsonResponse({"success": False})

        if response is not None:
            login = {"success": True, "account_id": response["account_id"], "token": response["token"]}
        else:
            login = {"success": False}
    return JsonResponse(login)


"""
createPost()
    request: data["account_id", "token", "message"]
"""
@csrf_exempt
def createPost(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("create post data ", data)
        result = queries.createPost(data["account_id"], data["Token"], data["message"])
        return JsonResponse(result)



# get account info
"""
getAccountInfo()
    request: data["account_id", "token"]
"""
@csrf_exempt
def getAccountInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        #result = queries.getAccountInfo(data["account_id"], data["Token"])
        result = queries.getAccountInfo(1, "laksdjfsldfkj")
        return JsonResponse(result)
    
    
"""
getCommunities()
    request:
"""
@csrf_exempt
def getCommunities(request):
    communities = []
    for community in Community.objects.all():
        communities.append({"community_name": community.communityName, "community_id":community.pk})

    return JsonResponse({"communities": communities})

"""
createEvent()
request: data[""]
"""
@csrf_exempt
def createEvent(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("create event data ", data)
        #project_id, interestType_id, venue_id, startDateTime, duration, price, name, description, account_id, token
#{'Token': 1, 'account_id': 1, 'name': 'The ', 'description': 'F', 'price': 0, 'duration': 4, 'startDateTime': '2023-10-17T13:49:21.950Z', 'venue_id': 1, 'project_id': 1, 'interest_id': 1}
        result = queries.createEvent(
            data["project_id"], data["interest_id"], data["venue_id"], data["startDateTime"], data["duration"], data["price"], data["name"], data["description"], data["account_id"], data["Token"]
        )
        return JsonResponse(result)
    

"""
 getVenues()
    request:
 """
@csrf_exempt
def getVenues(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        venues = []
        for venue in Venue.objects.all():
            venues.append({
                "venue_id": venue.pk,
                "venue_name": venue.locationName,
                "address": venue.address,
                "capacity": venue.capacity,
                "gps_longitude": venue.gpsLongitude,
                "gps_latitude": venue.gpsLatitude
            })
        return JsonResponse({"venues": venues})
    
"""
getInterestTypes()
"""
@csrf_exempt
def getInterestTypes(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        interests = []
        for interest in InterestType.objects.all():
            interests.append({
                "interest_id": interest.pk,
                "interest": interest.interestType
            })

        return JsonResponse({"interests": interests})
    
"""
getProjects()
"""
@csrf_exempt
def getProjects(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        projects = []
        for project in Project.objects.all():
            projects.append({
                "project_id": project.pk,
                "id": project.pk,
                "project_name": project.projectName,
                "description": project.description
            })

        return JsonResponse({"projects": projects})


"""
getAttendance()
    request: data["event_id]
"""
@csrf_exempt
def getAttendance(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        event = Event.objects.get(pk=data["event_id"])

        account = Account.objects.get(pk=data["account_id"], token=data["Token"])
        ticketedEvents = Ticket.objects.filter(event=event, account=account)

        if len(ticketedEvents) > 0: #found at least one ticket for this account for this event
            return JsonResponse({"attendance": True})
        else:
            return JsonResponse({"attendance": False})


"""
getAttendance()
    request: data["event_id]
"""
@csrf_exempt
def setAttendance(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("data is", data)

        result = queries.joinEvent(data["account_id"], data["Token"], data["event_id"], data["attendance"])

        return JsonResponse(result)
    
"""
deleteEvent()
    request: data["event_id", "account_id", "Token"]
"""
@csrf_exempt
def deleteEvent(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        event = Event.objects.get(pk=data["event_id"])
        account = Account.objects.get(pk=data["account_id"], token=data["Token"])

        if event.creator == account:
            event.delete()
            return JsonResponse({"success": True, "message": "event deleted"})
        else:
            return JsonResponse({"success": False, "message": "could not delete user is not the creator"})
        
"""
getUserScore()
    request: data["account_id", "Token"]
"""
@csrf_exempt
def getUserScore(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        account = Account.objects.get(pk=data["account_id"], token=data["Token"])

        score = queries.getUserScore(account)

        if score == -1:
            return JsonResponse({"success": False, "message": "no events cannot calculate score"})
        else:
            return JsonResponse({"success": True, "score": score})
        
"""
getCommunityScore()
    request: data["accout_id", "token"]
"""
@csrf_exempt
def getCommunityScore(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        account = Account.objects.get(pk=data["account_id"], token=data["Token"])
        community = account.community
        
        score = queries.getCommunityScore(community)
        return JsonResponse(score)
            
