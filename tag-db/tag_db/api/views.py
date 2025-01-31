from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import matchHistory
from .serializer import historySerializer

import sys

@api_view(['GET'])
def get_history(request):
    history = matchHistory.objects.all()
    serializer = historySerializer(history, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_Score(request):
    serializer = historySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['DELETE'])
# def delete_history(request):
#     try:
#         id = request.data.get('id')
#         if not id:
#             return Response({'body':"id required"},status=status.HTTP_400_BAD_REQUEST)
#         id = int(request.data.get('id'))
#         matchHistory.objects.get(id=id).delete()
#     except matchHistory.DoesNotExist :
#         return Response({'body': f'match with {id = } not found'},status=status.HTTP_404_NOT_FOUND)
#     return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def delete_history(request):
    matchHistory.objects.all().delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_winner(request):
    winner = request.data.get('winner')
    id = request.data.get('id')
    if not winner or not id:
        return Response({'body': 'winner and id required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        match = matchHistory.objects.get(id=id)
        serializer = historySerializer(match, data={'winner':winner}, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
    except matchHistory.DoesNotExist :
        return Response({'body':f'match with {id=} not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def getUserHistory(request):
    user = request.query_params.get('username')
    try:
        match = matchHistory.objects.filter(player1=user) | matchHistory.objects.filter(player2=user) 
        serializer = historySerializer(match, many=True)
    except matchHistory.DoesNotExist :
        return Response({'body':f'{user=} not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serializer.data, status=status.HTTP_200_OK)
