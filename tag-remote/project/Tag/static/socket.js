
// import {start_game} from '../Tag/tag.js'

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
        const socket = await connectWebSocket(`ws://${window.location.host}/ws/remote/`);
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
}

let socket = await(initializeApp());

socket.addEventListener('message', function(event) {
    let socket_data = JSON.parse(event.data)
    if (socket.readyState === WebSocket.OPEN && socket_data.content === "start game")
    {
        console.log("here")
        // connect_game();
        // start_game();
    }
})

export {socket}