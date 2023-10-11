from django.db import models
from datetime import datetime

# Create your models here.

# The community space
class Community(models.Model):
    communityName = models.CharField(max_length=100)
    health = models.IntegerField()

# Project - multiple projects within one community that events can be added to
class Project(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    projectName = models.CharField(max_length=100)
    startDate = models.DateTimeField(default=datetime.now)
    endDate = models.DateTimeField()
    description = models.CharField(max_length=200)

class Venue(models.Model):
    locationName = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    capacity = models.IntegerField()
    gpsLongitude = models.FloatField()
    gpsLatitude = models.FloatField()
    
class InterestType(models.Model):
    interestType = models.CharField(max_length=100)

class Account(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    accountName = models.CharField(max_length=100)
    birthday = models.DateField()
    gender = models.CharField(max_length=50)
    phoneNumber = models.IntegerField()
    email = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    salt = models.CharField(max_length=100)
    token = models.CharField(max_length=200)

class Event(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    interestType = models.ForeignKey(InterestType, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    startDateTime = models.DateTimeField(default=datetime.now)
    duration = models.IntegerField()
    price = models.FloatField()
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400)
    creator = models.ForeignKey(Account, on_delete=models.CASCADE)

class News(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    publicationDate = models.DateTimeField(default=datetime.now())
    description = models.CharField(max_length=500)

class AccountInterest(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    interestType = models.ForeignKey(InterestType, on_delete=models.CASCADE)

class DiscussionPost(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=datetime.now())
    text = models.CharField(max_length=200)

class Ticket(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)


