const users = []

const addUsers = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room) {
        return {
            error: 'Invalid username or room'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    if(existingUser) {
        return {
            error: 'Username already taken'
        }
    }

    const user = { id, username, room}
    users.push(user)
    return {user}
}

const removeUsers = (id) => {
    const user = users.findIndex((user) => {
       return user.id === id
    })

    if(user !== -1) {
        return users.splice(user, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}
    
module.exports = {
    addUsers,
    removeUsers,
    getUser,
    getUsersInRoom
}