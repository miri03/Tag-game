import asyncio
import time
import math

class gameMonitor:
    def __init__(self, consumer):
        self.canvas_height = 0

        self.gameconsumer = consumer
        self.players = [Player(0), Player(1)]
        self.players[0].tagger = True
        self.players[1].tagger = False
        self.time_tag = time.time()
        self.GO = False
        self.game_time = 1
        self.winner = None
        self.esc = False

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
        
        self.canvas_width = 0
        self.platform_widths = None
        self.platform_heights = None
        self.platform_xs = None
        self.platform_ys = None

    async def gameLoop(self):

        start_time = time.time()
        esc_time = 0
        await asyncio.sleep(0.005)

        while self.game_time:
            if not self.gameconsumer.is_open:
                break
            try:
                if self.esc:
                    if esc_time == 0:
                        esc_time = time.time()
                    await asyncio.sleep(0.05)
                    continue
                if esc_time:
                    start_time += time.time() - esc_time
                    esc_time = 0
                if self.game_time > 0:
                    self.game_time = math.floor(99 - time.time() + start_time)
                if self.game_time == 0:
                    if not self.players[0].tagger:
                        self.winner = self.players[0].name
                    else:
                        self.winner = self.players[1].name
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
                    # if not collision:
                    self.player.left_right(self, collision)
                
                if time.time() - self.time_tag > 3:
                    self.GO = True
                    self.Tag(self.players[0], self.players[1])
                else:
                    self.GO = False

                await self.gameconsumer.send_playerUpdate()
                await asyncio.sleep(0.005)

            except Exception as e:
                print(f"Error game loop: {e}")
                self.gameconsumer.is_open = False

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

        self.dimensionPercentageX = w * 100 / 1697
        self.dimensionPercentageY = 2.094

        self.position= {
            'x': x,
            'y': y,
        }
        self.pX = self.position['x'] * 100 / 1697
        self.pY = self.position['y'] * 100 / 955

class Player:
    def __init__(self, id):

        self.name = None
        self.id = id
        self.gravity = 0
        self.tagger = False

        self.width = 0
        self.height = 0
        self.dimensionPercenatge = 4.188

        self.position = {
            'x': 0,
            'y': 0,
            'pX': 0,
            'pY': 0
        }
        self.velocity = {
            'x': 0,
            'y': 0
        }
        self.vitesse={
            'right': 0,
            'left': 0,
            'up': 0,
        }

        self.tagVel = 0

        self.key={
            'right': False,
            'left': False,
            'upPressed': True,
            'upReleas': True,
        }

    def updatePlayer(self, canvas_height, canvas_width, initW, initH):

        self.height = self.dimensionPercenatge * canvas_height / 100
        self.width = self.height

        # vitesse of the movement
        self.vitesse['left'] = canvas_width * -2 / 1697
        self.vitesse['right'] = canvas_width * 2 / 1697
        self.vitesse['up'] = canvas_height * -7 / 955

        self.vitesse['right'] = 1 if self.vitesse['right'] == 0 else self.vitesse['right']
        self.vitesse['left'] = -1 if self.vitesse['left'] == 0 else self.vitesse['left']
        self.vitesse['up'] = 1 if self.vitesse['up'] == 0 else self.vitesse['up']

        # player position
        if initW:

            self.position['pX'] = self.position['x'] * 100 / initW
            self.position['pY'] = self.position['y'] * 100 / initH
            
            self.position['x'] = self.position['pX'] * canvas_width / 100
            self.position['y'] = self.position['pY'] * canvas_height / 100

        else:
            if self.id == 0:
                self.position['x'] = canvas_width/4
            else:
                self.position['x'] = 3*canvas_width/4

        self.gravity = canvas_height * 0.1 / 955

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
           
async def resizeWindow(text_data_json, self_cons, game_monitor):

    window_innerHeight = text_data_json.get('window_innerHeight')
    window_innerWidth = text_data_json.get('window_innerWidth')

    if window_innerHeight < 10:
        return
    init = game_monitor.canvas_width
    test = game_monitor.canvas_height
    game_monitor.canvas_height = window_innerHeight - 6

    Width = (16 * game_monitor.canvas_height) / 9
    if (Width < window_innerWidth - 6):
        game_monitor.canvas_width = Width
    else:
        game_monitor.canvas_width = window_innerWidth - 6
        game_monitor.canvas_height = (9 * (game_monitor.canvas_width - 6)) / 16

    for player in game_monitor.players:
        player.updatePlayer(game_monitor.canvas_height, game_monitor.canvas_width, init, test)

    if game_monitor.players[0].name == None:
        game_monitor.players[0].name = text_data_json.get('player0_name')

    if game_monitor.players[1].name == None:
        game_monitor.players[1].name = text_data_json.get('player1_name')

    for platform in game_monitor.platforms:
        platform.width = platform.dimensionPercentageX * game_monitor.canvas_width / 100
        platform.height = platform.dimensionPercentageY * game_monitor.canvas_height / 100
        platform.position['x'] = platform.pX * game_monitor.canvas_width / 100
        platform.position['y'] = platform.pY * game_monitor.canvas_height / 100

    game_monitor.platform_widths = [platform.width for platform in game_monitor.platforms]
    game_monitor.platform_heights = [platform.height for platform in game_monitor.platforms]
    game_monitor.platform_xs = [platform.position['x'] for platform in game_monitor.platforms]
    game_monitor.platform_ys = [platform.position['y'] for platform in game_monitor.platforms]

    await self_cons.send_playerUpdate()
    await self_cons.send_gameUpdate()
    