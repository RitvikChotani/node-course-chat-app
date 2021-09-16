const generate = (user, text) => {
    return {
        user,
        text,
        time: new Date().getTime()
    }
}

const generateLocation = (user,url) => {
    return {
        user,
        url,
        time: new Date().getTime()
    }
}

module.exports = {
    generate,
    generateLocation
}