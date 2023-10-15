from .models import Account, Project, AccountInterest, Event, Ticket, Community
from datetime import datetime, timedelta
from . import security

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
            events.append({
                "id": event.id, 
                "name": event.name,
                "venue_name": event.venue.locationName,
                "gps_longitude": event.venue.gpsLongitude,
                "gps_latitude": event.venue.gpsLatitude,
                "duration": event.duration,
                "start_date_time": event.startDateTime,
                "creator_name": event.creator.accountName,
                "capacity": event.venue.capacity,
                "attendance": getEventAttendance(events)
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
        events.append({"id": ticket.event.id, "name": ticket.event.name})
    return events


def getSalt(email):
    if Account.objects.get(email=email).exists():
        return Account.objects.get(email=email).salt
    

def verify(email, password_hashed):
    account = Account.objects.get(email=email, password=password_hashed)
    if account.exists():
        token = security.generateToken()
        account.token = token
        account.save()

        return {"account_id": account.id, "token":token}
    else:
        return None
    

def createPost(account_id, token, message):
    return