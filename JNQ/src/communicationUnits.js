function Message({ recipient, isPersistent = true, message }) {
    if(!recipient)
        throw "This message has no recipient!"
    
        checkMessageFormat(message)

    return { recipientId: recipient, isPersistent, message }
}

function Event({ isPersistent = true, message }) {
    checkMessageFormat(message)

    return new Message({ recipient: '*', isPersistent, message })
}

function checkMessageFormat(message) {
    if(!message || !message.name || !message.content)
        throw `Wrong format. Message needs 'name' and 'content' properties. Instead it is ${JSON.stringify(message)}`
}

module.exports = { Message, Event }