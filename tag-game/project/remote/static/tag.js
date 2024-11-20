import { socket } from './socket.js'
import {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform} from './image_src.js';

async function start_game()
{
    class Platform{
        constructor({x, y, w})
        {
            this.width = w
            this.height = 20
        
            this.position= {
                x: x,
                y: y, 
            }
            this.dimensionPercentageX = w * 100 / 1697
            this.dimensionPercentageY = 2.094

            this.pX = x * 100 / 1697
            this.pY = y * 100 / 955
        }
    
        draw() {
            c.save()
    
            c.shadowColor = 'rgba(32, 174, 221, 0.8)'; 
            c.shadowBlur = 30;                    // Blur radius for the shadow
            c.shadowOffsetX = 2;                 // Horizontal shadow offset
            c.shadowOffsetY = 2;                 // Vertical shadow offset
            load_draw(platform, this.position.x ,this.position.y, this.width, this.height)
            c.restore()
        }
    }

    class Player{
        constructor({imgR, imgL, imgIR, imgIL, ply_name}) {
            
            this.name = ply_name
            this.imageR = imgR
            this.imageL = imgL
            this.imageIdlR = imgIR
            this.imageIdlL = imgIL
    
            this.image = new Image()
            this.image = this.imageIdlR[2]
    
            this.tagger = true
            
            this.width = 40
            this.height = 40
            
            this.dimensionPercenatge = 4.188

            this.position= {
                x: 0,
                y: 0,
                pX: 0,
                pY: 0
            }
    
            this.keyStatus={
                rightPressed: false,
                leftPressed: false,
                upPressed: true,
                upreleased: true,
            }
    
        }
    
        draw() {
            load_draw(this.image, this.position.x ,this.position.y, this.width, this.height)
        }
    }

    function draw_timer(time, player)
    {
        let dec = Math.floor(time/10)
        let uni = time%10
        load_draw(numbers[dec], canvas.width/2, player[0].height, player[0].width, player[0].height)
        load_draw(numbers[uni], canvas.width/2 + player[0].width, player[0].height, player[0].width, player[0].height)
        
        let size = player[0].height*75/100
        c.font = `${size}px Volax`
        c.fillStyle = 'rgba(207, 62, 90, 0.8)'
        
        c.direction = "ltr";
        c.textBaseline = 'top';
        c.fillText(player[0].name, canvas.width/10, player[0].height)


        c.fillStyle = 'rgba(32, 174, 221, 0.8)'
        c.direction = "rtl"
        c.fillText(player[1].name, canvas.width - canvas.width/10, player[1].height)

    }

    function rain()
    {
        let raindrops = []
        let count = canvas.width * 60 / 1697
    
        for (let i = 0; i < count; i++) {
            raindrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedX: canvas.width * -20 / 1697, // Horizontal wind effect
                length: canvas.height * (Math.random() * 20 + 30) / 955
            });
        }
    
        raindrops.forEach(raindrop => {
            // Create a gradient for the raindrop
            let grd = c.createLinearGradient(raindrop.x, raindrop.y, raindrop.x + raindrop.speedX, raindrop.y + raindrop.length)
            grd.addColorStop(0, "rgba(255, 255, 255, 0.2)")
            grd.addColorStop(1, "rgba(255, 255, 255, 0)")
    
            c.strokeStyle = grd
            c.lineWidth = canvas.height * 3.5 / 955
    
            c.beginPath()
            c.moveTo(raindrop.x, raindrop.y)
            c.lineTo(raindrop.x + raindrop.speedX, raindrop.y + raindrop.length)
            c.stroke()
        });
    }

    const canvas = document.getElementById('canva');
    const c = canvas.getContext("2d");
    const platforms = [
        new Platform({x:302, y:288, w:153}),
        new Platform({x:1000, y:280, w:138}),
        new Platform({x:1470, y:340, w:133}),
        new Platform({x:1245, y:400, w:135}),
        new Platform({x:0, y:472, w:359}),
        new Platform({x:636, y:480, w:180}),
        new Platform({x:1420, y:570, w:100}),

        new Platform({x:545, y:700, w:351}),
        new Platform({x:1070, y:720, w:245}),
        new Platform({x:0, y:800, w:300}),

        new Platform({x:0, y:935, w:375}),
        new Platform({x:375, y:935, w:375}),
        new Platform({x:750, y:935, w:375}),
        new Platform({x:1125, y:935, w:375}),
        new Platform({x:1500, y:935, w:377}),
    ]

    const players = [new Player({imgR:imageR1, imgL:imageL1, imgIR:imageIR1, imgIL:imageIL1}), new Player({imgR:imageR2, imgL:imageL2, imgIR:imageIR2, imgIL:imageIL2})]
    
    let GO = false
    let time = 1
    let winner, winner_color
    let stop_animation = false

    canvas.width = 0;
    resizeWindow()

    if (socket.readyState === WebSocket.OPEN)
    {
        let p0_x = (players[0].position.x / canvas.width) * 1697
        let p1_x = (players[1].position.x / canvas.width) * 1697

        socket.send(JSON.stringify({
            'action': 'init players position',
            'player0_x': p0_x,
            'player1_x': p1_x,
        }))
    }

    animation()

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function blink()
    {
        let i = 0
        for (; i < 3; i++)
        {
            players.forEach(player=>{

                if (player.imageIdlR.includes(player.image))
                    player.image = player.imageIdlR[i]
                else if (player.imageIdlL.includes(player.image))
                    player.image = player.imageIdlL[i]

                c.clearRect(0, 0, canvas.width, canvas.height)
                player.draw()
            })
            await delay(100)
        }
    }

    const blinK = setInterval(blink, 2000)

    function animation()
    {
        if (socket.readyState === WebSocket.OPEN)
        {
            socket.send(JSON.stringify({
                'action': 'key update',
                'P0_rightPressed': players[0].keyStatus.rightPressed,
                'P0_leftPressed': players[0].keyStatus.leftPressed,
                'P0_upreleased': players[0].keyStatus.upreleased,
            }))
        }

        if (stop_animation === false)
            window.requestAnimationFrame(animation)
        c.clearRect(0, 0, canvas.width, canvas.height)
        load_draw(background, 0, 0, canvas.width, canvas.height)

        platforms.forEach(platform =>{
            platform.draw()
        })
        players.forEach(player=>{
            player.draw()
            if (player.tagger)
            {
                if (!GO)
                    load_draw(go_arrow, player.position.x, player.position.y - player.height, player.width, player.height)
                else
                    load_draw(arrow, player.position.x + player.width/4, player.position.y - player.height, player.width/2, player.height/2)
            }
        })
        rain();
        if (!winner)
            draw_timer(time, players)
        if (time === 0 && socket.readyState === WebSocket.OPEN)
        {
            socket.close()
            time = 1
        }
    }

    function load_draw(image, x, y, width, height)
    {
        if (image.complete && image.naturalWidth !== 0)
        {
            c.drawImage(image, x, y, width, height)
        }
        else
        {
            image.onerror = ()=>{
                console.error("Failed to load the image.", image.src);
                return 0
            }
            image.onload = ()=>{
                c.drawImage(image, x, y, width, height)
            }
        }
    }

    function scale(data)
    {
        players.forEach(player=>{
            player.height = player.dimensionPercenatge * canvas.height / 100
            player.width = player.height
        })

        // player position
        players[0].position.pX = data.player0_x * 100 / 1697
        players[0].position.pY = data.player0_y * 100 / 955
        
        players[0].position.x = players[0].position.pX * canvas.width / 100
        players[0].position.y = players[0].position.pY * canvas.height / 100

        players[1].position.pX = data.player1_x * 100 / 1697
        players[1].position.pY = data.player1_y * 100 / 955
        
        players[1].position.x = players[1].position.pX * canvas.width / 100
        players[1].position.y = players[1].position.pY * canvas.height / 100
    }

    function receive_message(event)
    {
        let socket_data = JSON.parse(event.data)

        if (socket_data.action === "players_name")
        {
            console.log(socket_data)
            players[0].name = socket_data.p1
            players[1].name = socket_data.p2
        }

        if (socket_data.action === "update player")
        {
            scale(socket_data)

            players[0].tagger = socket_data.player0_Tagger
            players[1].tagger = socket_data.player1_Tagger
            GO = socket_data.GO
            time = socket_data.time
            winner = socket_data.winner
            winner_color = socket_data.winner_color
        }
        if (socket_data.action === "winner")
        {
            console.log("hereeee")
            winner = socket_data.winner
            winner_color = socket_data.winner_color
            socket.close()
        }

        if (winner)
            console.log("winner is=>", winner)

        if (socket_data.action === "update key")
        {
            if (imageL1 === players[0].image && socket_data.leftPressed0 === false)
                players[0].image = players[0].imageIdlL[2]

            else if (imageR1 === players[0].image && socket_data.rightPressed0 === false)
                players[0].image = players[0].imageIdlR[2]

            else if (socket_data.rightPressed0)
                players[0].image = players[0].imageR
            
            else if (socket_data.leftPressed0)
                players[0].image = players[0].imageL
            
            if (imageL2 === players[1].image && socket_data.leftPressed1 === false)
                players[1].image = players[1].imageIdlL[2]

            else if (imageR2 === players[1].image && socket_data.rightPressed1 === false)
                players[1].image = players[1].imageIdlR[2]

            else if (socket_data.rightPressed1)
                players[1].image = players[1].imageR
            
            else if (socket_data.leftPressed1)
                players[1].image = players[1].imageL
        }
    }

    function resizeWindow()
    {
        if (window.innerHeight < 10)
            return
        let initW = canvas.width
        let initH = canvas.height
        canvas.height = window.innerHeight - 6
        let Width = (16 * canvas.height) / 9
        if (Width < window.innerWidth - 6)
            canvas.width = Width
        else
        {
            canvas.width = window.innerWidth - 6
            canvas.height = (9 * (canvas.width - 6)) / 16
        }

        players.forEach(player=>{
            player.height = player.dimensionPercenatge * canvas.height / 100
            player.width = player.height

            // player position
            if (initW)
            {
                player.position.pX = player.position.x * 100 / initW
                player.position.pY = player.position.y * 100 / initH
                
                player.position.x = player.position.pX * canvas.width / 100
                player.position.y = player.position.pY * canvas.height / 100
            }
        })

        if (initW === 0)
        {
            players[0].position.x = canvas.width/4
            players[1].position.x = 3*canvas.width/4
        }

        platforms.forEach(platform=>{
            platform.width = platform.dimensionPercentageX * canvas.width / 100
            platform.height = platform.dimensionPercentageY * canvas.height / 100
            platform.position.x = platform.pX * canvas.width / 100
            platform.position.y = platform.pY * canvas.height / 100
        })
    }

    function keydown(event)
    {
        let key = event.code

        switch(key)
        {
            case "ArrowLeft":
            {
                players[0].keyStatus.leftPressed = true
                break
            }
            case "ArrowRight":
            {
                players[0].keyStatus.rightPressed = true
                break
            }
            case "ArrowUp":
            {
                players[0].keyStatus.upreleased = false
                break
            }
        }
    }

    function keyup(event)
    {
        let key = event.code

        switch(key)
        {
            case "ArrowLeft":
            {
                players[0].keyStatus.leftPressed = false
                break
            }
            case "ArrowRight":
            {
                players[0].keyStatus.rightPressed = false
                break
            }
            case "ArrowUp" :
            {
                players[0].keyStatus.upreleased = true
                break
            }
        }
    }

    function handleblur()
    {
        players.forEach(player=>{
            if (player.keyStatus.leftPressed)
            {
                player.keyStatus.leftPressed = false
                player.image = player.imageIdlL[2]
            }
        
            if (player.keyStatus.rightPressed)
            {
                player.keyStatus.rightPressed = false
                player.image = player.imageIdlR[2]
            }
        
            if (!player.keyStatus.upreleased)
                player.keyStatus.upreleased = true
        })
    }

    function quitgame()
    {
        stop_animation = true
        reload_data()
        document.getElementById('overlay').style.visibility = 'hidden'
        window.location.href = '/'
    }

    let button = document.querySelector('.overlay-button')

    button.addEventListener("click", quitgame)
    window.addEventListener("resize", resizeWindow)
    socket.addEventListener("message", receive_message)
    
    window.addEventListener("keydown", keydown)
    window.addEventListener("keyup", keyup)

    window.addEventListener("blur", handleblur)
    window.addEventListener("hashchange", hashchange)
    socket.addEventListener("close", disconnect)
    window.addEventListener("beforeunload", handleRelodQuit)

    function handleRelodQuit(event)
    {
        if (socket.readyState === WebSocket.OPEN)
        {
            stop_animation = true
            socket.close()
        }
    }

    async function disconnect()
    {
        if (winner)
        {
            document.getElementById('overlay').style.visibility = 'visible';
            document.getElementById('overlay').style.textShadow = winner_color

            const overlay = document.querySelector('.overlay-text')
            overlay.textContent = winner + ' wins'    
        }
        reload_data()
    }

    function hashchange()
    {
        if (window.location.hash !== "#/remoteTag")
        {
            stop_animation = true
            socket.close()
        }
    }

    function reload_data()
    {
        window.removeEventListener("keydown", keydown)
        window.removeEventListener("keyup", keyup)
        window.removeEventListener("blur", handleblur)
        window.removeEventListener("hashchange", hashchange)
        window.removeEventListener("close", disconnect)
        window.removeEventListener("beforeunload", handleRelodQuit)
        clearInterval(blinK)
    }
    
}

export{start_game}