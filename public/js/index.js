const socket = io()
const roomsTemplete = document.querySelector('#roomsTemplete').innerHTML

socket.emit('roomsListQ')

socket.on('roomsList', (rooms)=>{
    const html = Mustache.render(roomsTemplete, {rooms})
    document.querySelector('#rooms').insertAdjacentHTML('beforeend', html)
})