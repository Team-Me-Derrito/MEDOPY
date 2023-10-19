"""
routes.py
    This file includes the functions that are called when someone calls a particular url from the urls.py file. It will often call the queries.py file for database interactions that are repeated often.
"""
from .models import Event, Venue, Project, Account, AccountInterest, Ticket, Community, DiscussionPost, InterestType
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json, re
from . import queries, security

"""
getInterestEvents()
    Gets all events that match the current account's community and interests.
    request: data["account_id", "token"]
"""
@csrf_exempt
def getInterestEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("Getting interest events")

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)
        
        events = queries.getInterestEventsByAccount(query["account"])
        return JsonResponse({"events": events, "success": True})


"""
getEventInfo()
    Gets all necessary event info from the id for the event page.
    request: data["event_id"]
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
            "creatorPhoneNumber": event.creator.phoneNumber,
            "creator_id": event.creator.pk,
            "success": True
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
    request:
"""
@csrf_exempt
def getAllEvents(request):
    events = []
    for event in Event.objects.all():
        events.append({"eventID": event.id, "eventName": event.name, "description": event.description, "venue": event.venue.locationName})
    return JsonResponse({"events": events, "success": True})


"""
getAllCommuntiyEvents()
    Returns all the events of an account's community.
    request: data["account_id", "Token"]
"""
@csrf_exempt
def getAllCommunityEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)

        community = query["account"].community
        events = queries.getEventsByCommunty(community.pk)

        return JsonResponse({"events": events, "success": True})

"""
getAllCommunityEventsDisplay()
    Request: data["community_id"]
""" 
@csrf_exempt   
def getAllCommunityEventsDisplay(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        events = queries.getEventsByCommunty(data["community_id"])
        return JsonResponse({"events": events, "success": True})
    
"""
getUpcommingEvents()
    Returns all events in the next month.
"""
@csrf_exempt
def getUpcommingEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)

        community_id = query["account"].community.pk
        events = queries.getNextMonthCommunityEvents(community_id)
        return JsonResponse({"events": events, "success": True})


"""
getTicketed()
    Gets all event ids of an accounts upcomming ticketed events.
    request: data["account_id", "Token"]
"""
@csrf_exempt
def getTicketed(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)

        events = queries.getTicketedEvents(query["account"])

        return JsonResponse({"events": events, "success": True})
    
"""
getDiscussionPosts()
    Gets all the discussion posts for the current user's community
"""
@csrf_exempt
def getDiscussionPosts(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("communits posts data is", data)
        
        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)
        
        community = query["account"].community

        posts = []
        for post in DiscussionPost.objects.filter(community=community):
            posts.append({
                "accountName": post.account.accountName, 
                "timestamp":post.timestamp, 
                "text":post.text})
        
        return JsonResponse({"posts": posts, "success": True})
    
"""
newDiscussionPost()
    User can create a new post for the discussion board.
    request: data["account_id", "Token", "post_text"]
"""
@csrf_exempt
def newDiscussionPost(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)

        community = query["account"].community

        post = DiscussionPost(
            community=community,
            account=query["account"],
            timestamp=datetime.now(),
            text=data["post_text"]
            )
        post.save()
        return JsonResponse({"success": True, "message": "New post made"})


"""
searchEvents()
    For searching functions when using search bar to get event by name.
    request: data["account_id", "Token", "query"]
"""
@csrf_exempt  
def searchEvents(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)

        community = query["account"].community
        projects = Project.objects.filter(community=community)

        events = []
        for event in Event.objects.all():
            if (event.project in projects) and (re.search(data["query"], event.name)):
                events.append({"id": event.id, "name": event.name})

        return JsonResponse({"events": events, "success": True})


"""
getCommunityInfo()
    Get info for a particular community required for the display.
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
        if data["community_id"] == "1":
            scores = [3, 0, 0,
                        0, 1, 2, 0,
                        1, 3, 3, 2, 0,
                        3, 4, 3, 1,
                        2, 5, 4, 4, 2,
                        3, 4, 5, 2,
                        1, 1, 3, 3, 1,
                        0, 2, 1, 2,
                        0, 0, 0]
        elif data["community_id"] == "2":
            scores = [0, 0, 0,
                        0, 0, 3, 0,
                        0, 0, 1, 2, 0,
                        0, 2, 1, 0,
                        0, 4, 3, 5, 0,
                        1, 1, 2, 0,
                        0, 1, 2, 1, 0,
                        0, 3, 0, 0,
                        0, 0, 0]
        elif data["community_id"] == "3":
            scores = [5, 5, 5, 5, 5, 5, 5, 5, 
                        4, 4, 4, 4, 4, 4, 4, 4,
                        4, 4, 4, 4, 4, 4, 4, 4,
                        3, 3, 3, 3, 3, 3, 3, 3,
                        3, 3, 3, 3, 3, 3, 3, 3,
                        3, 3, 3, 3, 3, 3, 3, 3,
                        3, 3, 3, 3, 3, 3, 3, 3,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        2, 2, 2, 2, 2, 2, 2, 2,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1,
                        1, 1, 1, 1, 1, 1, 1, 1, 
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0]

        else:
            scores = []
            for account in Account.objects.filter(community=community):
                scores.append(queries.getUserScore(account))

        community_info = {
            "community_name": community.communityName, 
            "community_id": community.pk,
            "scores": scores,
            "success": True
            }
        return JsonResponse(community_info)
    

"""
getProjectsInCommunity()
    Gets all of the projects in a particular community and sends their
    info back in a json structure.
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
    Gets all the interests in a particular community and lists them
    in a json structure with the amount of people with that interest in
    the community.
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
                if accountInterest.interestType.interestType in communityInterests:
                    communityInterests[accountInterest.interestType.interestType] += 1
                else:
                    communityInterests[accountInterest.interestType.interestType] = 1

        return JsonResponse({'interests': [{'interest':k, 'count':v} for k, v in communityInterests.items()]})
    
"""
getCommunityPosts()
    Returns the posts on a community's discussion board
    request: data["community_id"]
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
    Function for accounts to login. The email and password the user has entered
    is received and it is checked if this email exists in the system if so the 
    salt is retrieved and added to the inserted password. The hashed password is
    then check with the existing accounts password in the db.
    If the password and email match a new session token is generated and stored
    under this account in the db and a success response is sent back to the app
    with the account id and session token to be stored and sent back when a new
    request is made.
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
            password_hashed = security.hash(data["Password"], salt)
            response = queries.verify(data["Email"], password_hashed)
        else:
            return JsonResponse({"success": False, "message": "This email doesn't exist in the database"})

        if response is not None:
            login = {"success": True, "account_id": response["account_id"], "token": response["token"]}
        else:
            login = {"success": False, "message": "Account's email and password couldn't be matched"}
    return JsonResponse(login)


"""
createPost()
    Allows accounts to create a new post on the communtiy discussion board
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


"""
getAccountInfo()
    Uses the account id and token to get all displayable information about the account.
    request: data["account_id", "token"]
"""
@csrf_exempt
def getAccountInfo(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)

        print(data)
        query = queries.getAccount(data["account_id"], data["Token"])
        if not query["success"]:
            return JsonResponse(query)
        
        result = queries.getAccountInfo(data["account_id"], data["Token"])
        
        return JsonResponse(result)
    
    
"""
getCommunities()
    Gets all of the communities
    request: data[]
"""
@csrf_exempt
def getCommunities(request):
    communities = []
    for community in Community.objects.all():
        communities.append({"community_name": community.communityName, "community_id":community.pk})

    return JsonResponse({"communities": communities})

"""
createEvent()
    Creates a new event in the database.
    request: data["project_id", "interest_id", "venue_id", "startDateTime", "duration", "price", "name", "description", "account_id", "Token"]
"""
@csrf_exempt
def createEvent(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("create event data ", data)
        result = queries.createEvent(
            data["project_id"], data["interest_id"], data["venue_id"], data["startDateTime"], data["duration"], data["price"], data["name"], data["description"], data["account_id"], data["Token"]
        )
        return JsonResponse(result)
    

"""
 getVenues()
    Gets all of the venues in the database.
    request: data[]
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
    Gets all of the interest types in the database.
    request: data[]
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
    Gets all of the projects in the database.
    request: data[]
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
    Gets whether the current user is attending an event or not.
    request: data["event_id", "Token", "account_id"]
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
setAttendance()
    Sets the attendance of an event as specified in the request data.
    request: data["event_id", "account_id", "Token", "attendance"]
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
    Removes an event if the account sending the request is the creator of the event.
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
    Calculates the current user's score based off of their community engagement.
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
    Calculates the score of a given community based of its members' engagement.
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

"""
updateAccount()
    For updating an existing acccount's information
    request: data["account_id", "Token", "accountName", "birthday", "gender", "phoneNumber"]
"""
@csrf_exempt
def updateAccount(request):
    if request.method == "POST":
        data = request.body.decode("utf-8")
        data = json.loads(data)
        print("update account data is ", data)

        accounts = Account.objects.filter(pk=data["account_id"], token=data["Token"])
        if len(accounts) != 1:
            JsonResponse({"success": False, "message": "Couldn't find this account in db"})
        
        account = accounts[0]

        account.accountName = data["AccountName"]
        account.birthday = data["Birthday"]
        account.gender = data["Gender"]
        account.phoneNumber = data["PhoneNumber"]
        account.email = data["Email"]

        community = Community.objects.get(pk=data["community_id"])
        account.community = community

        # remove old ones
        for interest in AccountInterest.objects.filter(account=account):
            interest.delete()

        # add new ones
        for interest_id in data["interestTypes"]:
            interest = InterestType.objects.get(pk=interest_id)
            accountInterest = AccountInterest(account=account, interestType=interest)
            accountInterest.save()

        account.save()
        return JsonResponse({"success": True, "message": "Account info updated"})