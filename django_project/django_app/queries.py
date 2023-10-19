"""
queries.py
    This file includes functions to help with the database interactions.
    These functions are mostly called from the routes.py file to aide
    with repeated code in the routes.py file.
"""
from .models import Account, Project, AccountInterest, Event, Ticket, Community, DiscussionPost, InterestType, Venue
from datetime import datetime, timedelta
from . import security
import statistics

"""
getInterestEventsByAccount()
    Gives a list of events the account would be interested in.
    Events where the interest type is one of the account's interest type.
    @param account_id - account's id
    @param token - account's current session token
"""
def getInterestEventsByAccount(account_token, account_id):
    account = Account.objects.get(id=account_id, token=account_token)
    projects = Project.objects.filter(community=account.community)
    interests = AccountInterest.objects.filter(account=account)

    events = []
    for event in Event.objects.all():
        if (event.project in projects) and (event.interestType in interests):
            struct = {"eventID": event.id, "eventName": event.name, "description": event.description, "venue": event.venue}
            events.append(struct)
   
    return events

"""
getEventAttendance()
    Gives the number of people that say they are attending the event.
    @param event - the event that attendance is being gotten for
"""
def getEventAttendance(event):
    tickets = Ticket.objects.filter(event=event)
    return len(tickets)

"""
getEventsByCommunity()
    Gives a list of events in a community.
    @param community_id - the id of the Community object
"""
def getEventsByCommunty(community_id):
    projects = Project.objects.filter(community=community_id)
    
    events = []
    for event in Event.objects.all():
        if (event.project in projects):
            attendance = getEventAttendance(event)
            events.append({
                "id": event.pk, 
                "project": event.project.projectName,
                "name": event.name,
                "venue_name": event.venue.locationName,
                "gps_longitude": event.venue.gpsLongitude,
                "gps_latitude": event.venue.gpsLatitude,
                "duration": event.duration,
                "start_date_time": event.startDateTime,
                "creator_name": event.creator.accountName,
                "capacity": event.venue.capacity,
                "attendance": attendance
                })
    return events

"""
getNextMonthCommunityEvents()
    Gets the upcoming events of a community within the next month.
    @param community_id - the id of the Community object
"""
def getNextMonthCommunityEvents(community_id):
    curr_date = datetime.now().date()
    end_date = curr_date + timedelta(days=30)
    upcomming_events = Event.objects.filter(
        startDateTime__date__range=(curr_date, end_date)
    )
    community = Community.objects.get(id=community_id)
    
    events = []
    for event in upcomming_events:
        if (event.project.community == community):
            events.append({"id": event.id, "name": event.name})

    return events

"""
getTicketedEvents()
    Gets all events that an account has joined.
    @param account - the account object
"""
def getTicketedEvents(account):
    events = []
    for ticket in Ticket.objects.filter(account=account):
        events.append({"event_id": ticket.event.id, "name": ticket.event.name, "account_id": ticket.account.id})
    return events

"""
getSalt()
    Will check the database to see if there is an email matching the email param
    if there isn't it returns None otherwise returns the salt associated witht the
    account.
    @param email - account email inputted when logging in.
"""
def getSalt(email):
    try:
        Account.objects.get(email=email)
    except Account.DoesNotExist:
        return None
    else:
        return Account.objects.get(email=email).salt
    
"""
verify()
    Verifies if the email and hashed password matches a record in the database.
    @param email - email inputted when loggin in
    @param password_hashed - the password inputted when loggin in that has been hashed
"""
def verify(email, password_hashed):
    account = Account.objects.filter(email=email, password=password_hashed)
    if len(account) == 1:
        token = security.generateKey()
        account[0].token = token
        account[0].save()

        return {"account_id": account[0].pk, "token":token}
    else:
        return None
    
"""
createPost()
    Creates a new DiscussionPost object by the account whose info is provided with the given message.
    @param account_id - the account id sent by the mobile app
    @param token - the session token sent by the mobile app
    @param message - the message that the discussion post will include
"""
def createPost(account_id, token, message):
    account = Account.objects.get(pk=account_id, token=token)

    post = DiscussionPost(community=account.community, account=account, text=message)
    post.save()
    return {"success": True}

"""
getAccountInfo()
    Gets the info for the account whose information has been provided
    @param account_id - the account id sent by the mobile app
    @param token - the session token sent by the mobile app
"""
def getAccountInfo(account_id, token):
    account = Account.objects.filter(pk=account_id, token=token)

    interests = []
    for interest in AccountInterest.objects.filter(account=account[0]):
        interests.append({"interest": interest.interestType.interestType})

    score = getUserScore(account[0])
    info = {
        "community": account[0].community.communityName,
        "name": account[0].accountName,
        "birthday": account[0].birthday,
        "gender": account[0].gender,
        "phoneNumber": account[0].phoneNumber,
        "email": account[0].email,
        "interests": interests,
        "score": score
    }
    return info

"""
joinEvent()
    Allows the account whose information has been provided to attend a given event or 
    if ticketed is false remove the ticket.
    @param account_id - the account id sent by the mobile app
    @param token - the session token sent by the mobile app
    @event_id - the event the account will join/unjoin
    @ticketed - a boolean, if true the account would like to attend, if false the account would no longer like to attend
"""
def joinEvent(account_id, token, event_id, ticketed):
    account = Account.objects.get(id=account_id, token=token)
    event = Event.objects.get(id=event_id)
    if ticketed:
        ticket = Ticket(account=account, event=event)
        ticket.save()
        return {"success": True}
    else:
        ## fix when get returns nothing
        ticket = Ticket.objects.get(account=account, event=event)
        ticket.delete()
        return {"success": True}

"""
createEvent()
    Allows a new event to be created.
    @param project_id - the id of the project the new event is associated with
    @param interestType_id - the id of the interest that the event is related to
    @param venue_id - the id of the venue the event will be held at
    @param startDateTime - when the event will begin
    @param duration - how long the event will be in hours
    @param price - how much the event will cost
    @param name - the name of the event
    @param description - the description of the new event
    @param account_id - the id of the account creating the event 
    @param token - the token of the account creating the event
"""
def createEvent(project_id, interestType_id, venue_id, startDateTime, duration, price, name, description, account_id, token):
    project = Project.objects.get(pk=project_id)
    interestType = InterestType.objects.get(pk=interestType_id)
    venue = Venue.objects.get(pk=venue_id)
    creator = Account.objects.get(pk=account_id, token=token)

    event = Event(
        project=project,
        interestType=interestType,
        venue=venue,
        startDateTime=startDateTime,
        duration=duration,
        price=price,
        name=name,
        description=description,
        creator=creator
    )
    event.save()
    return({"event_id": event.id})

"""
getCommunityScore()
    Gets the score for a particular community. Based on the number of people attending events out of the total capacity of event venues
    @param community - the community object to get the score for 
"""
def getCommunityScore(community):
    events = getEventsByCommunty(community.pk)

    eventSignupRatio = []
    for event in events:
        capacity = event.venue.capacity
        tickets = Ticket.objects.filter(event=event)

        score = len(tickets) / capacity * 100
        eventSignupRatio.append(score)

    avg_score = statistics.mean(eventSignupRatio)
    return {"score": avg_score}

"""
getUserScore()
    Gets the user's current score based on how many events they have joined.
    @param account - the account object that the score is being gotten for
"""
def getUserScore(account):
    events = Event.objects.all()
    accountTickets = Ticket.objects.filter(account=account)
    if len(events) == 0:
        return -1
    else:
        percentScore = len(accountTickets) / len(events) * 100
        return percentScore