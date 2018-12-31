/**
 * ids are generated in lexographical order. eg nextMessageId("MSG9") = "MSG90"
 */
function nextMessageId(msg) {
    return addOffset(msg, 1)
}

function addOffset(msg, offset) {
    const msgComponents = msg.split("MSG")
    if(!isValidFormat(msgComponents))
        throw `Wrong message id: ${msg}`
    if(offset < 0)
        throw `Can't add negative offset: ${offset}`

    while(offset > 0) {
        msg = addOne(msg)
        offset -= 1
    }

    return msg
}

function addOne(msg) {
    const msgComponents = msg.split("MSG")
    const numberLen = msgComponents[1].length
    const lastDigit = msgComponents[1].substr(numberLen-1)

    if(lastDigit === '9')
        return "MSG" +msgComponents[1] +"0"
    else 
        return "MSG" +msgComponents[1].substr(0, numberLen-1) +( Number(lastDigit)+1 )
}

function compare(msg1, msg2) {
    const msg1Components = msg1.split("MSG")
    if(!isValidFormat(msg1Components))
        throw `Wrong message id: ${msg1}`
    
    const msg2Components = msg2.split("MSG")
    if(!isValidFormat(msg2Components))
        throw `Wrong message id: ${msg2}`

    return msg1 < msg2 ? -1 : ( msg1 > msg2 ? 1 : 0 ) 
}

function isValidFormat(msgComponents) {
    return ( msgComponents.length === 2 &&
        msgComponents[0] === '' && msgComponents[1] !== '' &&
        !isNaN(Number(msgComponents[1])) && Number(msgComponents[1]) >= 0 )
}

module.exports = { nextMessageId, addOffset, compare }