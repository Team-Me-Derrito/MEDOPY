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

class Event(models.Model):
    project = models.ForeignKey(Community, on_delete=models.CASCADE)
    interestType = models.ForeignKey(InterestType, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    startDateTime = models.DateTimeField(default=datetime.now)
    duration = models.IntegerField()
    price = models.FloatField()

class Venue(models.Model):
    locationName = models.CharField(max_length=100)
    capacity = models.IntegerField()
    gpsLongitude = models.FloatField()
    gpsLattitude = models.FloatField()

class Account(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    accountName = models.CharField(max_length=100)
    age = models.IntegerField()

class News(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=)
