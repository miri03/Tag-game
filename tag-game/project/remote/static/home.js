
let buttonRemote = document.getElementById('Remote')
let buttonLocal = document.getElementById('Local')

buttonRemote.addEventListener('click', (event)=>{
    let username = document.getElementById('Username').value.trim()
    if (username)
    {
        console.log("username =>", username)
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