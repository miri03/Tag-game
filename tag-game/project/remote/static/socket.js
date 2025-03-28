
import {start_game} from './tag.js'

if (localStorage.getItem('username') === null)
{
    window.location.href = '/'
    exit()
}

console.log((!localStorage.getItem('username')))

let socket = await(initializeApp());
let cancelButton = document.querySelector('.cancel-button')

if (socket.readyState === WebSocket.OPEN)
{
    socket.send(JSON.stringify({
        'action': 'players name',
        'name' : localStorage.getItem('username')
    }))
    localStorage.removeItem('username')
}

function connectWebSocket(url) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            resolve(socket);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };

        socket.onclose = (event) => {
            reject(new Error('WebSocket connection closed'));
        };
    });
}

async function initializeApp()
{
    try{
        const socket = await connectWebSocket(`ws://${window.location.hostname}:8007/ws/remote/`);
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
}

cancelButton.addEventListener('click', ()=>{
    socket.close()
    window.location.href = '/'
})

socket.addEventListener('message', function(event) {
    let socket_data = JSON.parse(event.data)
    if (socket.readyState === WebSocket.OPEN && socket_data.content === "start game")
    {
        document.getElementById("loading").style.visibility = 'hidden'
        document.getElementById("Tag").style.visibility = 'visible'

        start_game();
    }
})

export {socket}