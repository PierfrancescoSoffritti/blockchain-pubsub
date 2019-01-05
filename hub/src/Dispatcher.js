function Dispatcher(connectedClients, SEPARATOR) {
    this.dispatch = function(fullMessage) {
        const {recipient, payload} = fullMessage

        if(recipient === '*')
            broadcast(payload);
        else if(connectedClients[recipient])
            connectedClients[recipient].write( JSON.stringify(payload) +SEPARATOR );
        else
            console.error(`Can't dispatch message: ${fullMessage}`);
    }

    function broadcast(payload) {
        for (let clientId in connectedClients)
            connectedClients[clientId].write( JSON.stringify(payload) +SEPARATOR );
    }
}

module.exports = Dispatcher;