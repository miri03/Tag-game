import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

from . import init

class MyConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.monitor = init.gameMonitor(self)
        self.is_open = True

        await self.accept()
        await self.send(text_data=json.dumps({
            'action': 'you are now connected!'
        }))

        asyncio.create_task(self.monitor.gameLoop())

    async def send_playerUpdate(self):
        await self.send(text_data=json.dumps({
            'action': 'update player',
            'player0_x': self.monitor.players[0].position['x'],
            'player0_y': self.monitor.players[0].position['y'],
            'upPressed0': self.monitor.players[0].key['upPressed'],

            'player1_x': self.monitor.players[1].position['x'],
            'player1_y': self.monitor.players[1].position['y'],
            'upPressed1': self.monitor.players[1].key['upPressed'],

            'player_width': self.monitor.players[0].width,
            'player_height': self.monitor.players[0].height,

            'player0_Tagger': self.monitor.players[0].tagger,
            'player1_Tagger': self.monitor.players[1].tagger,
            'GO': self.monitor.GO,
            'time': self.monitor.game_time,
            'winner': self.monitor.winner,
        }))

    async def send_gameUpdate(self):
        await self.send(text_data=json.dumps({
            'action': 'game update',
            'canvas_width': self.monitor.canvas_width,
            'canvas_height': self.monitor.canvas_height,

            'platform_widths': self.monitor.platform_widths,
            'platform_heights': self.monitor.platform_heights,
            'platform_xs': self.monitor.platform_xs,
            'platform_ys': self.monitor.platform_ys
        }))

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        if action == "window resize":
            await init.resizeWindow(text_data_json, self, self.monitor)

        if action == "key update":
            self.monitor.players[0].key['right'] = text_data_json.get('P0_rightPressed')
            self.monitor.players[1].key['right'] = text_data_json.get('P1_rightPressed')

            self.monitor.players[0].key['left'] = text_data_json.get('P0_leftPressed')
            self.monitor.players[1].key['left'] = text_data_json.get('P1_leftPressed')

            self.monitor.players[0].key['upPressed'] = text_data_json.get('P0_upPressed')
            self.monitor.players[1].key['upPressed'] = text_data_json.get('P1_upPressed')

            self.monitor.players[0].key['upReleas'] = text_data_json.get('P0_upreleased')
            self.monitor.players[1].key['upReleas'] = text_data_json.get('P1_upreleased')

            for self.monitor.player in self.monitor.players:
                if self.monitor.player.key['upReleas'] == False and self.monitor.player.key['upPressed'] == False:
                    self.monitor.player.velocity['y'] = self.monitor.player.vitesse['up']
                    self.monitor.player.key['upPressed'] = True
            
            self.monitor.esc = text_data_json.get('esc')

    async def disconnect(self, close_code):
        self.is_open = False
        pass
