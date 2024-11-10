import { socket } from './socket.js'
import {imageR1, imageL1, imageIR1, imageIL1, imageR2, imageL2, imageIR2, imageIL2, arrow, go_arrow, numbers, background, platform} from './image_src.js';
// import {tag_game_info, setTagGameInfo} from '../ta/script.js'
// import {get_localstorage, check_access_token} from '../../auth.js'
const host = "127.0.0.1"

const tag_game_info = {
    player1name: "miri",
    player2name: "halima",
}

// var api = `https://${host}:9004/api/`
// var api_tag = `https://${host}:9007/api/tag-gamedb/`

// export async function fetchUserName() {
//     await check_access_token()
//       try {
//         const userResponse = await fetch(api + 'auth/get-user/', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + get_localstorage('token'),
//             'Session-ID': get_localstorage('session_id')
//           },
//           credentials: 'include',
//         });
        
//         if (userResponse.status === 404) {
//             logoutf();
//             window.location.hash = '/login';
//           }

//         if (!userResponse.ok)
//           throw new Error(`Status: ${response.status}, Message: ${jsonData.message || 'Unknown error'}`);

//         let data_user = await userResponse.json()

//         let username = data_user.user_data.username
//         return (username);
//       }
//       catch(error){
//         console.error('There was a problem with the fetch operation:', error);
//       }
// }

async function start_game()
{

    class Platform{
    
        width = 0
        height = 20
    
        position= {
            x: 0,
            y: 0,
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
    
            this.position= {
                x: 0,
                y: 0,
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

    // async function game_score(winner)
    // {
    //     await check_access_token()
    //     let winner_id
    //     if (winner === tag_game_info.player1name)
    //         winner_id =  tag_game_info.player1_id
    //     else
    //         winner_id =  tag_game_info.player2_id

    //     const data = {
    //         game_id: tag_game_info.game_id,
    //         winner_name: winner,
    //         winner_id: winner_id
    //     }
    //     try{
    //         const response = await fetch(api_tag + 'add-game-score/', {
    //             method: 'POST',
    //             headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer ' + get_localstorage('token'),
    //             'Session-ID': get_localstorage('session_id')
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify(data)
    //         });
    //         const jsonData = await response.json()
    //         if (!response.ok) {
    //           console.error(`Status: ${response.status}, Message: ${jsonData.message || 'Unknown error'}`)
    //         }
    //     }
    //     catch(error){
    //         console.error('Request failed', error)
    //     }
        
    // }

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
        c.fillText(tag_game_info.player1name, canvas.width/10, player[0].height)


        c.fillStyle = 'rgba(32, 174, 221, 0.8)'
        c.direction = "rtl"
        c.fillText(tag_game_info.player2name, canvas.width - canvas.width/10, player[1].height)

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
    const platforms = Array.from({ length: 15 }, () => new Platform())
    const players = [new Player({imgR:imageR1, imgL:imageL1, imgIR:imageIR1, imgIL:imageIL1, ply_name:tag_game_info.player1name}), new Player({imgR:imageR2, imgL:imageL2, imgIR:imageIR2, imgIL:imageIL2, ply_name:tag_game_info.player2name})]
    
    let GO = false
    let time = 1
    let winner, winner_color
    let stop_animation = false

    canvas.width = 0;
    canvas.height = 0;
    if (socket.readyState === WebSocket.OPEN)
    {
        let p1_name 
        let p2_name
        // const username = await fetchUserName()
        const username = "test_change"

        if (players[0].name === username)
        {
            p1_name = username 
            p2_name = players[1].name 
        }
        else
        {
            p1_name = username
            p2_name = players[0].name 
        }
        socket.send(JSON.stringify({
            'action': 'players name',
            'p1': p1_name,
            'p2': p2_name,
        }))
    }

    resizeWindow()
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
        // if (!winner)
            // draw_timer(time, players)
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

    function receive_message(event)
    {
        let socket_data = JSON.parse(event.data)
        if (socket_data.action === "game update")
        {
            canvas.height = socket_data.canvas_height
            canvas.width = socket_data.canvas_width
            
            let platformWidths = socket_data.platform_widths
            let platformHeights = socket_data.platform_heights
            let platformXs = socket_data.platform_xs
            let platformYs = socket_data.platform_ys

            for (let i = 0; i < platformWidths.length; i++)
            {
                platforms[i].width = platformWidths[i]
                platforms[i].height = platformHeights[i]
                platforms[i].position.x = platformXs[i]
                platforms[i].position.y = platformYs[i]
            }
            players[0].position.x = socket_data.player0_x
            players[0].position.y = socket_data.player0_y

            players[1].position.x = socket_data.player1_x
            players[1].position.y = socket_data.player1_y

            players[0].width = socket_data.player_width
            players[1].width = socket_data.player_width

            players[0].height = socket_data.player_height
            players[1].height = socket_data.player_height
        }

        if (socket_data.action === "update player")
        {
            players[0].position.x = socket_data.player0_x
            players[0].position.y = socket_data.player0_y

            players[1].position.x = socket_data.player1_x
            players[1].position.y = socket_data.player1_y

            players[0].width = socket_data.player_width
            players[1].width = socket_data.player_width

            players[0].height = socket_data.player_height
            players[1].height = socket_data.player_height

            players[0].tagger = socket_data.player0_Tagger
            players[1].tagger = socket_data.player1_Tagger
            GO = socket_data.GO
            time = socket_data.time
            winner = socket_data.winner
            winner_color = socket_data.winner_color

            resolution()
        }

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

    function resolution()
    {
        players.forEach(player=>{
            let pX = player.position.x * 100 / 1697
            let pY = player.position.y * 100 / 955
            
            player.position.x = pX * canvas.width / 100
            player.position.y = pY * canvas.height / 100

            player.height = 4.188 * canvas.height / 100
            player.width = player.height
            console.log(player.height, player.width)
        })
    }

    function resizeWindow()
    {
        console.log("resize window")
        if (socket.readyState === WebSocket.OPEN)
        {
            socket.send(JSON.stringify({
                'action': 'window resize',
                'window_innerHeight': window.innerHeight,
                'window_innerWidth': window.innerWidth,
                'canvas_height': canvas.height,
                'canvas_width': canvas.width,

                'player0_positionX': players[0].position.x,
                'player0_positionY': players[0].position.y,

                'player1_positionX': players[1].position.x,
                'player1_positionY': players[1].position.y,

                'player0_name': players[0].name,
                'player1_name': players[1].name
            }))
        }
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
        window.location.hash = '#/ta'
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
        if (winner && window.location.hash === "#/remoteTag")
        {
            document.getElementById('overlay').style.visibility = 'visible';
            document.getElementById('overlay').style.textShadow = winner_color

            const overlay = document.querySelector('.overlay-text')
            overlay.textContent = winner + ' wins'    
        }
        if (winner)
            await game_score(winner)
        // winner = null
        // setTagGameInfo(null)
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