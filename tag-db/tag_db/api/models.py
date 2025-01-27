from django.db import models

# Create your models here.

class matchHistory(models.Model):
    player1 = models.CharField(max_length=100, null=False, blank=False)
    player2 = models.CharField(max_length=100, null=False, blank=False)
    winner =  models.CharField(max_length=100)
