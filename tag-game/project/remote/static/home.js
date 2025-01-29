
let buttonRemote = document.getElementById('Remote')
let buttonLocal = document.getElementById('Local')
let buttonHistory = document.getElementById('historyButton')
let buttonDelete = document.getElementById('delete')


buttonRemote.addEventListener('click', (event)=>{
    let username = document.getElementById('Username').value.trim()
    if (username)
    {
        localStorage.removeItem('username')
        localStorage.setItem('username', username)
        window.location.href = "tag.html"
    }
    else
    {
        document.getElementById('Username').placeholder = "Insert username"
        document.getElementById('Username').classList.add('custom-placeholder');
        event.preventDefault()
    }
})

buttonLocal.addEventListener('click', (event)=>{
    let firstP = document.getElementById('First Player').value.trim()
    let secondP = document.getElementById('Second Player').value.trim()

    if (firstP && secondP)
    {
        localStorage.removeItem('first player')
        localStorage.removeItem('second player')

        localStorage.setItem('first player', firstP)
        localStorage.setItem('second player', secondP)
        window.location.href = "game.html"
    }

    if (!firstP)
    {
        document.getElementById('First Player').placeholder = "Insert username"
        document.getElementById('First Player').classList.add('custom-placeholder');
        event.preventDefault()
    }
    if (!secondP)
    {
        document.getElementById('Second Player').placeholder = "Insert username"
        document.getElementById('Second Player').classList.add('custom-placeholder');
        event.preventDefault()
    }
})

buttonHistory.addEventListener('click', dispalyHistory)

async function dispalyHistory()
{
    document.getElementById('history_list').style.visibility = 'visible'
    document.getElementById('home').style.visibility = 'hidden'
    const ulElement = document.querySelector('#history_list ul')
    while (ulElement.firstElementChild) {
        ulElement.removeChild(ulElement.firstElementChild);
    }

    let response = await fetch('http://127.0.0.1:8000/api/matchHistory/')
    const jsonData = await response.json();
    
    jsonData.forEach(game => {
        const li = document.createElement("li")
        if (game.winner === game.player1)
        {
            li.innerHTML = `
            <span style="color: rgb(196, 16, 76);">${game.player1}</span>
            <span style="color: rgb(220,20,60);"> W </span>
            <span style="color: rgb(80, 200, 120);"> L </span>
            <span style="color: rgb(32, 174, 221);">${game.player2}</span>
            `
        }
        else{
            li.innerHTML = `
            <span style="color: rgb(196, 16, 76);">${game.player1}</span>
            <span style="color: rgb(220,20,60);"> L </span>
            <span style="color: rgb(80, 200, 120);"> W </span>
            <span style="color: rgb(32, 174, 221);">${game.player2}</span>
            `
        }

        ulElement.appendChild(li)
    });
}

buttonDelete.addEventListener("click", async()=>{
    await fetch("http://127.0.0.1:8000/api/delete_history/", {'method':'DELETE'})
    dispalyHistory()
})
