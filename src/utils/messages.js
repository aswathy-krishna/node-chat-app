const generateMessage = (username,text) => {
    return{
        username,
        text,
        createdAt : new Date().getTime()
    }
}

const generateURL = (username,url) => {
    return{
        username,
        url,
        lcreatedAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateURL
}