import {start_game} from './localTag.js';

let socket;

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
        const socket = await connectWebSocket(`ws://${window.location.host}/ws/tag-game/`);
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
}

socket = await initializeApp();
if (socket.readyState === WebSocket.OPEN)
{
    console.log('##########################################################')
    start_game();
}

export{socket}