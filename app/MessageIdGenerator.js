function nextMessageId(msg) {
    return addOffset(msg, 1)
}

function addOffset(msg, offset) {
    const msgComponents = msg.split("MSG")
    if( msgComponents.length !== 2 || isNaN(Number(msgComponents[1])) )
        throw `Wrong message id: ${msg}`

    const lastMsgNumber = Number(msgComponents[1])
    const newMsgNumber = lastMsgNumber + offset
    return "MSG" +newMsgNumber
}

function compare(msg1, msg2) {
    const msg1Components = msg1.split("MSG")
    if( msg1Components.length !== 2 || isNaN(Number(msg1Components[1])) )
        throw `Wrong message id: ${msg1}`
    
    const msg2Components = msg2.split("MSG")
    if( msg2Components.length !== 2 || isNaN(Number(msg2Components[1])) )
        throw `Wrong message id: ${msg2}`

    return msg1Components[1] - msg2Components[1]
}

module.exports = { nextMessageId, addOffset, compare }