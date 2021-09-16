const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = document.querySelector("input")
const $messageFormButton = document.querySelector("#btn")
const $locButton = document.querySelector("#loc")
const $messages = document.querySelector("#chat-message")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML 
const locationTemplate = document.querySelector("#location-template").innerHTML 
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML 

//options

// const autoScroll = () => {
//     // New message element
//     const $newMessage = $messages.lastElementChild

//     // Height of the new message
//     const newMessageStyles = getComputedStyle($newMessage)
//     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
//     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//     // Visible height
//     const visibleHeight = $messages.offsetHeight

//     // Height of messages container
//     const containerHeight = $messages.scrollHeight

//     // How far have I scrolled?
//     const scrollOffset = $messages.scrollTop + visibleHeight

//     if (containerHeight - newMessageHeight <= scrollOffset) {
//         $messages.scrollTop = $messages.scrollHeight
//     }
// }

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
socket.on("Message", (message) => {
    const html = Mustache.render(messageTemplate, {
        user: message.user,
        message: message.text,
        time: moment(message.time).format("h:mm A")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    $messages.scrollTop = $messages.scrollHeight
})

socket.on("locationMessage", (url) => {
    const html = Mustache.render(locationTemplate, {
        user: url.user,
        url: url.url,
        time: moment(url.time).format("h:mm A")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    $messages.scrollTop = $messages.scrollHeight
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    //Disable

    $messageFormButton.setAttribute("disabled", "disabled")

    const message = e.target.elements.message.value
    socket.emit("SendMessage", message, (error) => {
        //Enable
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
})

$locButton.addEventListener("click", (e) => {
    if(!navigator.geolocation) {
        return alert("Tjhe naya PC chahiye, geolocation tk nhi chlta tre m")
    }

    $locButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position) => { 
        const lat = position.coords.latitude
        const long = position.coords.longitude
        socket.emit("geolocation", { lat: lat, long: long }, () => {
           $locButton.removeAttribute("disabled")
            console.log("Location sent successfully")
        })
    })
})

socket.emit("join", {username, room} , (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

socket.on("room-data", ( {room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users,
    })
    document.querySelector("#sidebar").innerHTML = html
})