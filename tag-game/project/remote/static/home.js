
let buttonRemote = document.getElementById('Remote')
let buttonLocal = document.getElementById('Local')
let buttonHistory = document.getElementById('historyButton')


buttonRemote.addEventListener('click', (event)=>{
    let username = document.getElementById('Username').value.trim()
    if (username)
    {
        console.log("username =>", username)
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
    console.log('click local')
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

buttonHistory.addEventListener('click', async(event)=>{
    document.getElementById('history_list').style.visibility = 'visible'
    document.getElementById('home').style.visibility = 'hidden'
    const ulElement = document.querySelector('#history_list ul')

    let response = await fetch('http://127.0.0.1:8000/api/matchHistory/')
    const jsonData = await response.json();
    
    jsonData.forEach(game => {
        const li = document.createElement("li")
        li.innerHTML = `
        <span style="color: rgb(196, 16, 76);">${game.player1}</span>
        <span style="color: rgb(220,20,60);"> L </span>
        <span style="color: rgb(80, 200, 120);"> W </span>
        <span style="color: rgb(32, 174, 221);">${game.player2}</span>
        `

        ulElement.appendChild(li)
    });

})


// const li = document.createElement("li");
// li.textContent = history; // Set the text content of the <li>
// ulElement.appendChild(li); // Append the <li> to the <ul>