const net = require('net')

const SEPARATOR = "$$SEP$$"

function TCPClient(
    clientId,
    { onConnecting = () => {}, onConnected = () => {}, onConnectionClosed = () => {}, onError = () => {}, onMessageReceived = () => {} }) {

    const self = this

    let clientSocket
    const outQueue = []
    
    this.connectTo = function({ port, ip }) {
        return new Promise((resolve, reject) => {

            const client = new net.Socket()
            clientSocket = client

            client.connect({ port, ip }, onConnecting )

            client.on('connect', () => {
                resolve()

                onConnected()

                self.send({ senderId: clientId })
                flushOutQueue()
            })

            client.on('data', message => {
                String(message).split(SEPARATOR)
                    .filter(string => string.trim().length !== 0)
                    .map(message => JSON.parse(message))
                    .forEach(message => onMessageReceived(message) )
            })
            
            client.on('close', () => { onConnectionClosed(); resolve(); } )
            client.on('error', () => { onError(); reject(); } )

        })
    }

    this.send = function(message) {        
        message.senderId = clientId

        if(!clientSocket.connecting)
            clientSocket.write( JSON.stringify(message) +SEPARATOR)
        else
            outQueue.push(message)
    }

    this.finish = function() {
        if(clientSocket.connecting)
            clientSocket.on('connect', () => { onConnected(); clientSocket.end(); } )
        else
            clientSocket.end()
    }

    function flushOutQueue() {
        while(outQueue.length !== 0) {
            const data = outQueue.shift()
            self.send(data)
        }
    }
}

module.exports = TCPClient;