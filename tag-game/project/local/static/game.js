import {start_game} from './localTag.js';

let socket;
let fPlayer, sPlayer


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
    console.log(`${window.location.host}`)
    try{
        const socket = await connectWebSocket(`ws://${window.location.hostname}:8007/ws/tag-game/`);
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
}

socket = await initializeApp();
if (socket.readyState === WebSocket.OPEN)
{
    fPlayer = localStorage.getItem('first player') 
    sPlayer = localStorage.getItem('second player') 
    if (fPlayer === null || sPlayer === null)
    {
        socket.close()
        window.location.href = '/'
    }
    localStorage.removeItem('first player')
    localStorage.removeItem('second player')
    start_game();
}

export{socket, fPlayer,  sPlayer}