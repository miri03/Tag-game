
let button = document.getElementById('Remote')

button.addEventListener('click', (event)=>{
    let username = document.getElementById('Username').value.trim()
    if (username)
    {
        console.log("username =>", username)
        // localStorage.setItem('usernname', username)
        window.location.href = "tag.html"
    }
    else
    {
        document.getElementById('Username').placeholder = "Insert username"
        document.getElementById('Username').classList.add('custom-placeholder');
        event.preventDefault()
    }

})
