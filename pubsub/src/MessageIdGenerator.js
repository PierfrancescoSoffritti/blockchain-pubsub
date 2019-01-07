function MessageIdGenerator(messageIdPrefix) {
    const self = this

    if(messageIdPrefix.match(/[0-9]$/))
        throw `MessageId prefix cannot end with a number. ${messageIdPrefix} is not valid.`

    /**
     * ids are generated in lexographical order. eg nextMessageId("MSG9") = "MSG90"
     */
    this.nextMessageId = function(msg) {
        return self.addOffset(msg, 1)
    }

    this.addOffset = function(msg, offset) {
        const msgComponents = msg.split(messageIdPrefix)
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

    this.compare = function(msg1, msg2) {
        const msg1Components = msg1.split(messageIdPrefix)
        if(!isValidFormat(msg1Components))
            throw `Wrong message id: ${msg1}`
        
        const msg2Components = msg2.split(messageIdPrefix)
        if(!isValidFormat(msg2Components))
            throw `Wrong message id: ${msg2}`

        return msg1 < msg2 ? -1 : ( msg1 > msg2 ? 1 : 0 ) 
    }

    function isValidFormat(msgComponents) {
        return ( msgComponents.length === 2 &&
            msgComponents[0] === '' && msgComponents[1] !== '' &&
            !isNaN(Number(msgComponents[1])) && Number(msgComponents[1]) >= 0 )
    }

    function addOne(msg) {
        const msgComponents = msg.split(messageIdPrefix)
        const numberLen = msgComponents[1].length
        const lastDigit = msgComponents[1].substr(numberLen-1)

        if(lastDigit === '9')
            return messageIdPrefix +msgComponents[1] +"0"
        else 
            return messageIdPrefix +msgComponents[1].substr(0, numberLen-1) +( Number(lastDigit)+1 )
    }
}

module.exports = MessageIdGenerator