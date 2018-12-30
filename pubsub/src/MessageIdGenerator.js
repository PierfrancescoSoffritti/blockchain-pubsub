function nextMessageId(msg) {
    return addOffset(msg, 1)
}

function addOffset(msg, offset) {
    const msgComponents = msg.split("MSG")
    if(!isValidFormat(msgComponents))
        throw `Wrong message id: ${msg}`

    const lastMsgNumber = Number(msgComponents[1])
    const newMsgNumber = lastMsgNumber + offset
    return "MSG" +newMsgNumber
}

function compare(msg1, msg2) {
    const msg1Components = msg1.split("MSG")
    if(!isValidFormat(msg1Components))
        throw `Wrong message id: ${msg1}`
    
    const msg2Components = msg2.split("MSG")
    if(!isValidFormat(msg2Components))
        throw `Wrong message id: ${msg2}`

    return msg1Components[1] - msg2Components[1]
}

function isValidFormat(msgComponents) {
    return msgComponents.length === 2 && msgComponents[1] !== '' && !isNaN(Number(msgComponents[1]))
}

module.exports = { nextMessageId, addOffset, compare }