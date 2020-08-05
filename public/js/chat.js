const socket = io()

// Elements from DOM
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templetes
const messageTemplete = document.querySelector('#message-templete').innerHTML
const locationMessageTemplete = document.querySelector('#location-message-templete').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-templete').innerHTML

// AutoScroll function
const autoScroll = ()=>{
    // New message
    const $newMessage = $messages.lastElementChild
    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // Scroll to the bottom
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Options
const {username, createRoom, joinRoom} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// Check Joining Room
const roomCheck = () => {
    console.log(createRoom)
    console.log(joinRoom)
    if(createRoom && joinRoom){
        alert('Create a room or select an open room!')
        location.href = '/'
        return
    }
    return createRoom ? createRoom : joinRoom
}
const room = roomCheck()
console.log('room', room)

// Listen to the welcomeMsg when connection is established
socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplete, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Listen to the location share message
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplete, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //Disable form when submitted
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    // Send a msg to server from Client Interface
    socket.emit('sendMsg', message, (error)=>{
        // Enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('Msg was sent...', error)
    })
})

// Share a location via. Geolocation
$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    // Emit coordinates
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log('Location Shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
// Show users on sidebar
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplete, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
// Join Room
socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})