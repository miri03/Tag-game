from rest_framework import serializers
from .models import matchHistory
import sys

class historySerializer(serializers.ModelSerializer):
    class Meta:
        model = matchHistory
        fields = '__all__'