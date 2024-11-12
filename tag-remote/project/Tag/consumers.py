import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import uuid

from .init import gameMonitor, Player

players_c = []
games = {}

class MyConsumer(AsyncWebsocketConsumer):
	def __init__(self):
		self.groups = []

	async def connect(self):
		self.channel_layer = get_channel_layer()
		await self.accept()
		players_c.append(self)
		await self.starting()
		self.is_open = True

	async def starting(self):
		if len(players_c) == 2:
			self.firstConsumer = players_c.pop(0)
			self.secondConsumer = players_c.pop(0)
			group_name = str(uuid.uuid4()) ###this
			await self.channel_layer.group_add(group_name, self.firstConsumer.channel_name)
			await self.channel_layer.group_add(group_name, self.secondConsumer.channel_name)
			await self.channel_layer.group_send(group_name, {"type": "sendStart", "message": "start game"})
			games[group_name] = gameMonitor(self)
			asyncio.create_task(games[group_name].gameLoop())

	async def sendStart(self, event):
		try:
			message = event["message"]
			await self.send(text_data=json.dumps({
				"content": message
			}))
		except Exception as e:
			print(f"Error sendStart: {e}")

	async def groupName(self):
		for group, channel in self.channel_layer.groups.items():
			consumers = list(channel.keys())
			if self.channel_name in consumers:
				return group, consumers
		return None, None

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		action = text_data_json.get('action')

		group_name, consumers = await self.groupName()
		if group_name == None or consumers == None:
			return

    ############################################################################################
		if action == "players name":
			games[group_name].players[0].name = text_data_json.get("p1")
			games[group_name].players[1].name = text_data_json.get("p2")

    ############################################################################################
		if action == "init players position":
			games[group_name].players[0].position['x'] = text_data_json.get('player0_x')
			games[group_name].players[1].position['x'] = text_data_json.get('player1_x')
    ############################################################################################

		if action == "key update":
			if consumers[0] == self.channel_name:
				games[group_name].players[0].key['right'] = text_data_json.get('P0_rightPressed')
				games[group_name].players[0].key['left'] = text_data_json.get('P0_leftPressed')
				games[group_name].players[0].key['upReleas'] = text_data_json.get('P0_upreleased')
				if games[group_name].players[0].key['upReleas'] == False and games[group_name].players[0].key['upPressed'] == False:
					games[group_name].players[0].velocity['y'] = games[group_name].players[0].vitesse['up']
					games[group_name].players[0].key['upPressed'] = True

			elif consumers[1] == self.channel_name:
				games[group_name].players[1].key['right'] = text_data_json.get('P0_rightPressed')
				games[group_name].players[1].key['left'] = text_data_json.get('P0_leftPressed')
				games[group_name].players[1].key['upReleas'] = text_data_json.get('P0_upreleased')
				if games[group_name].players[1].key['upReleas'] == False and games[group_name].players[1].key['upPressed'] == False:
					games[group_name].players[1].velocity['y'] = games[group_name].players[1].vitesse['up']
					games[group_name].players[1].key['upPressed'] = True
    ############################################################################################

	async def send_playerUpdate(self, event):
		group_name, consumers = await self.groupName()
		if group_name == None or consumers == None:
			return

		try:
			await self.send(text_data=json.dumps({
				'action': 'update player',
				'player0_x': games[group_name].players[0].position['x'],
				'player0_y': games[group_name].players[0].position['y'],
				'upPressed0': games[group_name].players[0].key['upPressed'],

				'player1_x': games[group_name].players[1].position['x'],
				'player1_y': games[group_name].players[1].position['y'],
				'upPressed1': games[group_name].players[1].key['upPressed'],

				'player_width': games[group_name].players[0].width,
				'player_height': games[group_name].players[0].height,

				'player0_Tagger': games[group_name].players[0].tagger,
				'player1_Tagger': games[group_name].players[1].tagger,
				'GO': games[group_name].GO,
				'time': games[group_name].game_time,
				'winner': games[group_name].winner,
				'winner_color': games[group_name].winner_color
			}))
			
			await self.send(text_data=json.dumps({
				'action': 'update key',
				'leftPressed0': games[group_name].players[0].key['left'],
				'rightPressed0': games[group_name].players[0].key['right'],

				'leftPressed1': games[group_name].players[1].key['left'],
				'rightPressed1': games[group_name].players[1].key['right'],        
			}))
		except Exception as e:
			print(f"Error send player update: {e}")
			self.is_open = False

	async def sendWinner(self, event):
		group_name, consumers = await self.groupName()
		if group_name == None or consumers == None:
			return

		await self.send(text_data=json.dumps({
			'action': 'winner',
			'winner': games[group_name].winner,
			'winner_color': games[group_name].winner_color
		}))

	async def quitGame(self, group_name, consumers):
		if not games[group_name].winner:
			if self.channel_name == consumers[0]:
				games[group_name].winner = games[group_name].players[1].name
				games[group_name].winner_color = "2px 0px 8px rgba(32, 174, 221, 0.8)"
			elif self.channel_name == consumers[1]:
				games[group_name].winner = games[group_name].players[0].name
				games[group_name].winner_color = "2px 0px 8px rgba(207, 62, 90, 0.8)"
			
			await self.channel_layer.group_send(group_name, {"type": "sendWinner"})
			await asyncio.sleep(0.005)

	async def disconnect(self, code):
		self.is_open = False
		if quitLobby():
			return

		group_name, consumers = await self.groupName()
		if group_name == None or consumers == None:
			return

		await self.channel_layer.group_discard(
			group_name,
			self.channel_name
		)
		await self.quitGame(group_name, consumers)

def quitLobby():
	if len(players_c) > 0:
		players_c.pop(0)
		return 1