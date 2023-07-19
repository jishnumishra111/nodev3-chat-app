const socket = io()

//elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {

    //new mesage element

    const $newMessage = $messages.lastElementChild

     //Height of  mesage element


     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

     //Visible height

     const viisbleHeight = $messages.offsetHeight

     //height of messages container

     const containerHeight = $messages.scrollHeight

     //How far have i scrolled?

     const scrollOffset = $messages.scrollTop + viisbleHeight

     if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

     }


     console.log(newMessageMargin)

}


socket.on('message', (message) => {

    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationMessage', (message) => {

    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

    console.log(room, "my room")
    console.log(users)
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()

    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        //enable

        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered!')
    })

})

$sendLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {

        return alert('Geolocation is not supported by your browser.')

    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {

        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        socket.emit('sendLocation', {
            latitude: latitude,
            longitude: longitude
        }, (status) => {
            $sendLocationButton.removeAttribute('disabled')

            console.log("Location Shared")

        })



    })

})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }

})


// socket.on('countUpdated',()=>{

//     console.log("count is updated")
//     // document.querySelector('#increment').addEventListener('click',()=>{
//     //     console.log('clicked')
//     //     socket.emit('increment')
//     // })


// })