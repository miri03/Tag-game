
import asyncio
import time
import math
import requests

class gameMonitor:
    def __init__(self, consumer):
        self.canvas_width = 1697
        self.canvas_height = 955

        self.gameconsumer = consumer
        self.players = []
        self.players.append(Player(0, "player"))
        self.players.append(Player(1, "player"))

        self.time_tag = time.time()
        self.GO = False
        self.game_time = 1
        self.winner = None
        self.winner_color = None

        self.platforms = [
            Platform(1000, 280, 138),
            Platform(302, 288, 153),
            Platform(1470, 340, 133),
            Platform(1245, 400, 135),
            Platform(0, 472, 359),
            Platform(636, 480, 180),
            Platform(1420, 570, 100),

            Platform(545, 700, 351),
            Platform(1070, 720, 245),
            Platform(0, 800, 300),

            Platform(0, 935, 375),
            Platform(375, 935, 375),
            Platform(750, 935, 375),
            Platform(1125, 935, 375),
            Platform(1500, 935, 377),
        ]
        
        self.platform_widths = None
        self.platform_heights = None
        self.platform_xs = None
        self.platform_ys = None

    async def gameLoop(self):

        await asyncio.sleep(1)
        try:
            groupName, consumers = await self.gameconsumer.groupName()

            await self.gameconsumer.channel_layer.group_send(groupName, {"type": "sendStart"})
            await self.gameconsumer.channel_layer.group_send(groupName, {"type": "playersName"})
            await asyncio.sleep(0.005)

        except Exception as e:
            print(f"Error sending names: {e}")
            self.gameconsumer.is_open = False
            return

        start_time = time.time()
        await asyncio.sleep(0.005)

        while self.game_time:
            if not self.gameconsumer.is_open:
                break
                
            try:
                if self.game_time > 0:
                    self.game_time = math.floor(9 - time.time() + start_time)
                if self.game_time == 0:
                    if not self.players[0].tagger:
                        self.winner = self.players[0].name
                        self.winner_color = "2px 0px 8px rgba(207, 62, 90, 0.8)"
                    else:
                        self.winner = self.players[1].name
                        self.winner_color = "2px 0px 8px rgba(32, 174, 221, 0.8)"
                    myobj = {
                        'player1': self.players[0].name,
                        'player2': self.players[1].name,
                        'winner' : self.winner
                    }
                    requests.post('http://tagDb:8000/api/addScore/', json = myobj)

                collision = None
                for self.player in self.players:
                    self.player.fall(self)

                    for self.platform in self.platforms:
                        if self.player.topCollision(self.platform):
                            self.platform.collision[self.player.id] = True
                            self.player.position['y'] = self.platform.position['y'] - self.player.height
                            self.player.velocity['y'] = 0

                        elif self.player.bottomCollision(self.platform):
                            self.player.position['y'] = self.platform.position['y'] + self.platform.height
                            self.player.velocity['y'] = 0

                        elif self.player.leftCollision(self.platform):
                            self.player.velocity['x'] = 0
                            self.player.position['x'] = self.platform.position['x'] - self.player.width
                            collision = "left"

                        elif self.player.rightCollision(self.platform):
                            self.player.velocity['x'] = 0
                            self.player.position['x'] = self.platform.position['x'] + self.platform.width
                            collision = "right"

                    if self.player.tagger:
                        self.player.tagVel = self.player.vitesse['right'] / 3
                    else:
                        self.player.tagVel = 0
                    self.player.left_right(self, collision)
                
                if time.time() - self.time_tag > 3:
                    self.GO = True
                    self.Tag(self.players[0], self.players[1])
                else:
                    self.GO = False

                groupName, consumers = await self.gameconsumer.groupName()
                if groupName == None or consumers == None:
                    self.gameconsumer.is_open = False
                    break
                
                await self.gameconsumer.channel_layer.group_send(groupName, {"type": "send_playerUpdate"})
                await asyncio.sleep(0.005)

            except Exception as e:
                print(f"Error game loop: {e}")
                self.gameconsumer.is_open = False
                break

    def checkCollision(self, id):
        for self.platform in self.platforms:
            if self.platform.collision[id]:
                return 1
        return 0

    def Tag(self, player, enemy):
        if player.position['y'] <= enemy.position['y'] + enemy.height and player.position['y'] >= enemy.position['y'] or player.position['y'] + player.height <= enemy.position['y'] + enemy.height and player.position['y'] + player.height >= enemy.position['y']:
            if player.position['x'] + player.width >= enemy.position['x'] and player.position['x'] + player.width <= enemy.position['x'] + enemy.width :
                player.tagger = False if player.tagger == True else True
                enemy.tagger = False if player.tagger == True else True
                self.time_tag = time.time()
        
            elif player.position['x'] <= enemy.position['x'] + enemy.width and player.position['x'] >= enemy.position['x'] :
                player.tagger = False if player.tagger == True else True
                enemy.tagger = False if player.tagger == True else True
                self.time_tag = time.time()

class Platform:
    def __init__(self, x, y, w):
        self.width = w
        self.height = 20
        self.collision = [False, False]

        self.position= {
            'x': x,
            'y': y,
        }

class Player:
    def __init__(self, id, stt):

        self.name = None
        self.id = id
        self.status = stt

        self.gravity = 0.1
        if id % 2 == 0:
            self.tagger = True
        else:
            self.tagger = False

        self.width = 39.995
        self.height = 39.995
        self.dimensionPercenatge = 4.188

        self.position = {
            'x': 0,
            'y': 0
        }
        self.velocity = {
            'x': 0,
            'y': 0
        }
        self.vitesse={
            'right': 2,
            'left': -2,
            'up': -7,
        }

        self.tagVel = 0

        self.key={
            'right': False,
            'left': False,
            'upPressed': True,
            'upReleas': True,
        }

    def fall(self, game_monitor):

        if (self.position['y'] < 0): #top of the cavas
            self.position['y'] = 0
            self.velocity['y'] = 0

        elif self.position['y'] + self.height + self.velocity['y'] + self.gravity < game_monitor.canvas_height and not game_monitor.checkCollision(self.id) or (game_monitor.checkCollision(self.id) and self.velocity['y'] < 0) :
            self.velocity['y'] = self.gravity + self.velocity['y']
            self.position['y'] = self.velocity['y'] + self.position['y']

        else: #fall down 
            if not game_monitor.checkCollision(self.id):
                self.position['y'] = game_monitor.canvas_height - self.height
                self.velocity['y'] = 0
            self.key['upPressed'] = False

    def left_right(self, game_monitor, collision):

        if (self.key['right'] and self.key['left']):
            self.velocity['x'] = 0
        
        elif self.key['right'] and collision != "left":
            self.velocity['x'] = self.vitesse['right'] + self.tagVel

        elif self.key['left'] and collision != "right":
            self.velocity['x'] = self.vitesse['left'] - self.tagVel
        
        else:
            self.velocity['x'] = 0

        self.position['x'] = self.velocity['x'] + self.position['x']

        if self.position['x'] < 0:
            self.position['x'] = 0

        if self.position['x'] + self.width > game_monitor.canvas_width:
            self.position['x'] = game_monitor.canvas_width - self.width

    def topCollision(self, platform):
        if self.position['y'] + self.height < platform.position['y'] + platform.height and self.position['y'] + self.velocity['y'] + self.height >= platform.position['y'] and\
             self.position['x'] + self.width > platform.position['x'] and self.position['x'] < platform.position['x'] + platform.width:
            return 1
        platform.collision[self.id] = False
        return 0

    def bottomCollision(self, platform):
        if self.position['y'] + self.height >= platform.position['y'] and self.position['y'] + self.velocity['y'] <= platform.position['y'] + platform.height\
            and self.position['x'] + self.width > platform.position['x'] and self.position['x'] < platform.position['x'] + platform.width:
            return 1
        return 0

    def leftCollision(self, platform):
        if (self.position['x'] + self.width + self.velocity['x'] >= platform.position['x'] and self.position['x'] + self.width < platform.position['x'] + platform.width)\
            and ((self.position['y'] >= platform.position['y'] and self.position['y'] < platform.position['y'] + platform.height)
            or(self.position['y'] + self.height > platform.position['y'] and self.position['y'] + self.height < platform.position['y'] + platform.height)
            or (self.position['y'] < platform.position['y'] and self.position['y'] + self.height > platform.position['y'] + platform.height)):
            return 1
        return 0

    def rightCollision(self, platform):
        if (self.position['x'] + self.velocity['x'] <= platform.position['x'] + platform.width and self.position['x'] > platform.position['x'])\
            and ((self.position['y'] > platform.position['y'] and self.position['y'] < platform.position['y'] + platform.height)
            or (self.position['y'] + self.height > platform.position['y'] and self.position['y'] + self.height < platform.position['y'] + platform.height)
            or (self.position['y'] < platform.position['y'] and self.position['y'] + self.height > platform.position['y'] + platform.height)):
                return 1
        return 0
