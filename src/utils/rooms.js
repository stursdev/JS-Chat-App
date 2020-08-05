const {getUsers} = require('./users')

const rooms = []

const addRoom = (newRoom) => {
    // Clead the newRoom data
    newRoom = newRoom.trim().toLowerCase()

    // Check if the room exists in the room array
    const existingRoom = rooms.find((room)=> room === newRoom)

    if(existingRoom){
        return newRoom
    }

    rooms.push(newRoom)
    return newRoom
}

const removeRoom = (roomName) => {
    const userInRoom = getUsers().find( (user) => user.room === roomName )

    if(userInRoom){
        return
    }

    const index = rooms.findIndex((room)=> room === roomName)

    if(index !== -1){
        return rooms.splice(index, 1)[0]
    }
}

// Get Rooms
const getAllRooms = ()=> rooms

module.exports = {
    addRoom,
    removeRoom,
    getAllRooms
}