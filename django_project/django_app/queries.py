from .models import Account, Project, AccountInterest, Event, Ticket, Community, DiscussionPost, InterestType, Venue
from datetime import datetime, timedelta
from . import security
import statistics

"""
getInterestEventsByAccount()
    Gets all events for a particular accountToken and accountID with the right interestsType
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
getEventAttendance(event)
    Gives the number of people that say they are attending the event.
"""
def getEventAttendance(event):
    tickets = Ticket.objects.filter(event=event)
    return len(tickets)

"""
getEventsByCommunity()
    Gives a list of events in a community.
"""
def getEventsByCommunty(community_id):
    projects = Project.objects.filter(community=community_id)
    
    events = []
    for event in Event.objects.all():
        if (event.project in projects):
            attendance = getEventAttendance(event)
            events.append({
                "id": event.pk, 
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

def getTicketedEvents(account):
    events = []
    for ticket in Ticket.objects.filter(account=account):
        events.append({"event_id": ticket.event.id, "name": ticket.event.name, "account_id": ticket.account.id})
    return events


def getSalt(email):
    try:
        Account.objects.get(email=email)
    except Account.DoesNotExist:
        return None
    else:
        return Account.objects.get(email=email).salt
    

def verify(email, password_hashed):
    account = Account.objects.filter(email=email, password=password_hashed)
    if len(account) == 1:
        token = security.generateKey()
        account[0].token = token
        account[0].save()

        return {"account_id": account[0].pk, "token":token}
    else:
        return None
    

def createPost(account_id, token, message):
    account = Account.objects.get(pk=account_id, token=token)

    post = DiscussionPost(community=account.community, account=account, text=message)
    post.save()
    return {"success": True}

def getAccountInfo(account_id, token):
    account = Account.objects.filter(pk=account_id, token=token)

    interests = []
    for interest in AccountInterest.objects.filter(id=account_id):
        interests.append({"interest": interest.interestType.interestType})

    score = getUserScore(account)
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

def getUserScore(account):
    events = Event.objects.all()
    accountTickets = Ticket.objects.filter(account=account)
    if len(events) == 0:
        return -1
    else:
        percentScore = len(accountTickets) / len(events) * 100
        return percentScore