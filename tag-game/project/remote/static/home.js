
let buttonRemote = document.getElementById('Remote')
let buttonLocal = document.getElementById('Local')
let buttonHistory = document.getElementById('historyButton')
let buttonDelete = document.getElementById('delete')
let buttonClose = document.getElementById('close')
let getUser = document.getElementById('getUser')


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

buttonHistory.addEventListener('click', async ()=>{
    document.getElementById('history_list').style.visibility = 'visible'
    document.getElementById('home').style.visibility = 'hidden'
    
    let response = await fetch('http://127.0.0.1:8000/api/matchHistory/')
    if (response.status === 200)
    {
        const jsonData = await response.json();
        dispalyHistory(jsonData)
    }
})

function dispalyHistory(jsonData)
{   
    const historyRow = document.querySelector('#history_list tbody')
    console.log(historyRow)
    while (historyRow.firstElementChild) {
        historyRow.removeChild(historyRow.firstElementChild);
    }
    jsonData.forEach(game => {
        const tr = document.createElement("tr")
        let td1 = document.createElement("td")
        let tdL = document.createElement("td")
        let tdW = document.createElement("td")
        let td2 = document.createElement("td")
        tr.appendChild(td1)
        tr.appendChild(tdL)
        tr.appendChild(tdW)
        tr.appendChild(td2)

        if (game.winner === game.player1)
        {
            // li.innerHTML = `
            // <span style="color: rgb(196, 16, 76);">${game.player1}</span>
            // <span style="color: rgb(80, 200, 120);"> W </span>
            // <span style="color: rgb(220,20,60);"> L </span>
            // <span style="color: rgb(32, 174, 221);">${game.player2}</span>
            // `
            td1.innerHTML = `${game.player1}`
            td1.style.color =  "rgb(196, 16, 76)"

            td2.innerHTML = `${game.player2}`
            td2.style.color =  "rgb(32, 174, 221)"

            tdL.innerHTML = 'L'
            tdW.innerHTML = 'W'
        }
        // else{
        //     li.innerHTML = `
        //     <span style="color: rgb(196, 16, 76);">${game.player1}</span>
        //     <span style="color: rgb(220,20,60);"> L </span>
        //     <span style="color: rgb(80, 200, 120);"> W </span>
        //     <span style="color: rgb(32, 174, 221);">${game.player2}</span>
        //     `
        // }

        // ulElement.appendChild(li)
        historyRow.appendChild(tr)
    });
}

buttonDelete.addEventListener("click", async()=>{
    await fetch("http://127.0.0.1:8000/api/delete_history/", {'method':'DELETE'})
    let response = await fetch('http://127.0.0.1:8000/api/matchHistory/')
    if (response.status === 200)
    {
        const jsonData = await response.json();
        dispalyHistory(jsonData)
    }
})

buttonClose.addEventListener("click", ()=>{
    const ulElement = document.querySelector('#history_list ul')
    while (ulElement.firstElementChild) {
        ulElement.removeChild(ulElement.firstElementChild);
    }
    document.getElementById("history_list").style.visibility = "hidden"
    document.getElementById("home").style.visibility = "visible"
    document.getElementById('getUser').value = ''
})

getUser.addEventListener("click", ()=>{
    getUser.addEventListener('keypress', async(event)=>{
        if (event.code === "Enter")
        {
            let username = document.getElementById('getUser').value.trim()
            let response
            if (!username)
            {
                response = await fetch('http://127.0.0.1:8000/api/matchHistory/')
            }
            else
            {
                response = await fetch(`http://127.0.0.1:8000/api/getUserHistory/?username=${encodeURIComponent(username)}`)
            }
            if (response.status === 200)
            {
                const jsonData = await response.json();
                dispalyHistory(jsonData)
            }
        }
    })
})
