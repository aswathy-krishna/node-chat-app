const socket = io()


//elements
 const $messageForm = document.querySelector('#message-form')
 const $messageInput = $messageForm.querySelector('input')
 const $LocationButton = document.querySelector('#sendLocation')
 const $messageButton = $messageForm.querySelector('#msg_send')
 // Select the element in which you want to render the template
const $messages = document.querySelector('#messages')
// Select the template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//side bar scrolling
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }
   }


// options
const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix:true })
socket.on('message', (message) => {
    console.log(message)
    // Render the template with the message data
 const html = Mustache.render(messageTemplate, {
    username : message.username,
    message : message.text,
    createdAt : moment(message.createdAt).format('h:mm a')

    })
    // Insert the template into the DOM
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
 })

 socket.on('location_message', (urls) => {
     console.log("fff"+urls)
     const html = Mustache.render(locationmessageTemplate, {
        username :urls.username,
        url:urls.url,
        lcreatedAt : moment(urls.lcreatedAt).format('h:mm a')
        })
        // Insert the template into the DOM before end 
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
 })

// side menu users
socket.on('roomData', ({ room, users }) => {
 const html = Mustache.render(sidebarTemplate, {
 room,
 users
 })
 document.querySelector('#sidebar').innerHTML = html
})

// for button click action
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageButton.setAttribute('disabled','disabled')
    // const message = document.querySelector('input').value
    const message = e.target.elements.msg.value
    socket.emit('sendMessage',message,(error) => {
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput,focus()
       // console.log('the message was delivered',message)
       if(error){
           return console.log(error)
       }

       console.log('message delivered')
    })
})

// share location
$LocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("location sharing not supported")
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { 
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            console.log('location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
    alert(error)
    location.href = '/'
    }
   }) 