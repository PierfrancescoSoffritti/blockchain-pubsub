function Dispatcher(connectedClients, SEPARATOR) {
    this.dispatch = function(message) {
        const {recipientId} = message

        if(recipientId === '*')
            broadcast(message);
        else if(connectedClients[recipientId])
            connectedClients[recipientId].write( JSON.stringify(message) +SEPARATOR );
        else
            console.error(`[DISPATCHER] Can't dispatch message: ${message}`);
    }

    function broadcast(message) {
        for (let clientId in connectedClients)
            connectedClients[clientId].write( JSON.stringify(message) +SEPARATOR );
    }
}

module.exports = Dispatcher;