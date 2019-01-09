function Message({ recipientId, isPersistent = true, message }) {
    if(!recipient)
        throw "This message has no recipient!"
    if(!message || !message.name || !message.content)
        throw `Wrong format. Message needs 'name' and 'content' properties. Instead it is ${JSON.stringify(message)}`

    return { recipientId, isPersistent, message }
}

function Event({ isPersistent = true, message }) {
    if(!message || !message.name || !message.content)
        throw `Wrong format. Message needs 'name' and 'content' properties. Instead it is ${JSON.stringify(message)}`

    return new Message({ recipientId: '*', isPersistent, message })
}

module.exports = { Message, Event }