from django.contrib import admin
from .models import Community, Project, Venue, InterestType, Event, News, Account, AccountInterest, DiscussionPost, TicketTierType, Ticket

# Register your models here.
admin.site.register(Community)
admin.site.register(Project)
admin.site.register(Venue)
admin.site.register(Event)
admin.site.register(InterestType)
admin.site.register(Account)
admin.site.register(News)
admin.site.register(AccountInterest)
admin.site.register(DiscussionPost)
admin.site.register(TicketTierType)
admin.site.register(Ticket)