import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import uuid

from .init import gameMonitor, Player, resizeWindow

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

    # async def connect(self):
    #     self.is_open = True
        
    #     self.start_game = False
    #     self.monitor = gameMonitor(self)
    #     self.room_group_name = "game_room"
    #     self.id = len(self.players_c)
    #     self.enemy_id = 0 if self.id == 1 else 1
    #     await self.channel_layer.group_add(
    #         self.room_group_name,
    #         self.channel_name
    #     )

    #     await self.accept()

    #     if len(self.players_c) < 2:
    #         self.players_c.append(self)

    #     if len(self.players_c) == 2:
    #         self.players_c[0].monitor.players = [Player(0, "player"), Player(1, "enemy")]
    #         self.players_c[1].monitor.players = [Player(0, "enemy"), Player(1, "player")]


	async def starting(self):
		if len(players_c) == 2:
			firstPlayer = players_c.pop(0)
			secondPlayer = players_c.pop(0)
			group_name = str(uuid.uuid4()) ###this
			await self.channel_layer.group_add(group_name, firstPlayer.channel_name)
			await self.channel_layer.group_add(group_name, secondPlayer.channel_name)
			await self.channel_layer.group_send(group_name, {"type": "send_start", "message": "start game"})
			games[group_name] = gameMonitor(self)
			asyncio.create_task(games[group_name].gameLoop())

	async def send_start(self, event):
		message = event["message"]

		await self.send(text_data=json.dumps({
			"content": message
		}))
 
	async def disconnect(self, code):
		pass

    # async def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     action = text_data_json.get('action')
    #     game_id = text_data_json.get('game_id')

    #     ###########################################################################################
    #     if self.is_open and action == "new game":
    #         if len(self.players_c) == 2:
    #             if add_game_if_not_exists(self.games, game_id, self.players_c):
    #                 await self.send_all('start game')

    #     ###########################################################################################
    #     if self.is_open and self.start_game and action == "window resize":
    #         await resizeWindow(text_data_json, self, self.monitor)

    #     ###########################################################################################
    #     if self.is_open and self.start_game and action == "players name":
    #         self.monitor.players[self.id].name = text_data_json.get("p1")
    #         self.monitor.players[self.enemy_id].name = text_data_json.get("p2")
    #         print("status", self.monitor.players[self.id].status, self.monitor.players[self.id].name)

    #     ###########################################################################################
    #     if self.is_open and self.start_game and action == "key update":
    #         index = get_game_index(self.games, self.game_id)
    #         if len(self.games[index][1]) < 2:
    #             return

    #         self.games[index][1][self.id].monitor.players[self.id].key['right'] = text_data_json.get('P0_rightPressed')
    #         self.games[index][1][self.enemy_id].monitor.players[self.id].key['right'] = text_data_json.get('P0_rightPressed')

    #         self.games[index][1][self.id].monitor.players[self.id].key['left'] = text_data_json.get('P0_leftPressed')
    #         self.games[index][1][self.enemy_id].monitor.players[self.id].key['left'] = text_data_json.get('P0_leftPressed')

    #         self.games[index][1][self.id].monitor.players[self.id].key['upReleas'] = text_data_json.get('P0_upreleased')
    #         self.games[index][1][self.enemy_id].monitor.players[self.id].key['upReleas'] = text_data_json.get('P0_upreleased')

    #         if self.games[index][1][self.id].monitor.players[self.id].key['upReleas'] == False and self.games[index][1][self.id].monitor.players[self.id].key['upPressed'] == False:
    #             self.games[index][1][self.id].monitor.players[self.id].velocity['y'] = self.games[index][1][self.id].monitor.players[self.id].vitesse['up']
    #             self.games[index][1][self.id].monitor.players[self.id].key['upPressed'] = True

    #         if self.games[index][1][self.enemy_id].monitor.players[self.id].key['upReleas'] == False and self.games[index][1][self.enemy_id].monitor.players[self.id].key['upPressed'] == False:
    #             self.games[index][1][self.enemy_id].monitor.players[self.id].velocity['y'] = self.games[index][1][self.enemy_id].monitor.players[self.id].vitesse['up']
    #             self.games[index][1][self.enemy_id].monitor.players[self.id].key['upPressed'] = True
    #     ###########################################################################################

    # async def send_all(self, message):
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {'type': 'to_all','message': message}
    #     )

    # async def to_all(self, event):
    #     await self.send(text_data=json.dumps({
    #         'content': event['message']
    #     }))

    # async def send_gameUpdate(self):
    #     await self.send(text_data=json.dumps({
    #         'action': 'game update',
    #         'canvas_width': self.monitor.canvas_width,
    #         'canvas_height': self.monitor.canvas_height,

    #         'platform_widths': self.monitor.platform_widths,
    #         'platform_heights': self.monitor.platform_heights,
    #         'platform_xs': self.monitor.platform_xs,
    #         'platform_ys': self.monitor.platform_ys,
    #     }))

    # async def send_playerUpdate(self):
    #     await self.send(text_data=json.dumps({
    #         'action': 'update player',
    #         'player0_x': self.monitor.players[0].position['x'],
    #         'player0_y': self.monitor.players[0].position['y'],
    #         'upPressed0': self.monitor.players[0].key['upPressed'],

    #         'player1_x': self.monitor.players[1].position['x'],
    #         'player1_y': self.monitor.players[1].position['y'],
    #         'upPressed1': self.monitor.players[1].key['upPressed'],

    #         'player_width': self.monitor.players[0].width,
    #         'player_height': self.monitor.players[0].height,

    #         'player0_Tagger': self.monitor.players[0].tagger,
    #         'player1_Tagger': self.monitor.players[1].tagger,
    #         'GO': self.monitor.GO,
    #         'time': self.monitor.game_time,
    #         'winner': self.monitor.winner,
    #         'winner_color': self.monitor.winner_color
    #     }))
    #     index = get_game_index(self.games, self.game_id)
    #     if len(self.games[index][1]) < 2:
    #         return
        
    #     await self.send(text_data=json.dumps({
    #         'action': 'update key',
    #         'leftPressed0': self.games[index][1][self.id].monitor.players[0].key['left'],
    #         'rightPressed0': self.games[index][1][self.id].monitor.players[0].key['right'],
            
    #         'leftPressed1': self.games[index][1][self.id].monitor.players[1].key['left'],
    #         'rightPressed1': self.games[index][1][self.id].monitor.players[1].key['right'],        
    #     }))

	# async def disconnect(self, code):
		# self.is_open = False
		# index = get_game_index(self.games, self.game_id)
		# print("disconnected consumer", self)
		# if self.games[index][1][0] == self:
		# 	self.games[index][1].pop(0)
		# else:
		# 	self.games[index][1].pop(1)

		# print("consumers in game after", self.games[index][1])
		# await self.channel_layer.group_discard(
		# 	self.room_group_name,
		# 	self.channel_name
		# )
		# if len(self.games[index][1]) == 0:
		# 	self.games.pop(index)
		# print("games array after", self.games)

# def add_game_if_not_exists(games, game_id, players):

#     for game in games:
#         if game[0] == game_id:
#             return 0
#     players[0].game_id = game_id
#     players[1].game_id = game_id

#     players[0].start_game = True
#     players[1].start_game = True

#     asyncio.create_task(players[0].monitor.gameLoop())
#     asyncio.create_task(players[1].monitor.gameLoop())

#     games.append([game_id, [players[0], players[1]]])
#     players.clear()
#     return 1

# def get_game_index(games, game_id):
#     for i, game in enumerate(games):
#         if game[0] == game_id:
#             return i
#     return -1