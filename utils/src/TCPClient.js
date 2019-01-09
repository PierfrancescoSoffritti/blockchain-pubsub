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

            const socket = new net.Socket()
            clientSocket = socket
            
            socket.connect({ port, ip }, onConnecting)
            
            socket.on('connect', () => {
                self.send({ senderId: clientId })
                flushOutQueue()

                onConnected()
                resolve()
            })

            socket.on('data', message => {
                String(message).split(SEPARATOR)
                    .filter(string => string.trim().length !== 0)
                    .map(message => JSON.parse(message))
                    .forEach(message => onMessageReceived(message) )
            })
            
            socket.on('close', () => { onConnectionClosed(); resolve(); } )
            socket.on('error', error => { onError(error); reject(`Error occurred while connecting to hub at ${ip}:${port} :\n${error}`); } )
        })
    }

    this.send = function(message) {     
        if(!clientSocket)
            throw `Connection not initiated`

        message.senderId = clientId

        if(!clientSocket.connecting)
            clientSocket.write( JSON.stringify(message) +SEPARATOR)
        else
            outQueue.push(message)
    }

    this.finish = function() {
        if(!clientSocket)
            throw `Connection not initiated`

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

module.exports = TCPClient