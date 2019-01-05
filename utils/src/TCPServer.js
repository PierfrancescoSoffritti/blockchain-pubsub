const net = require('net')

const SEPARATOR = "$$SEP$$"

function TCPServer({ onClientConnected = () => {}, onMessage = () => {}, onEnd = () => {}, onError = () => {}, onClose = () => {} }) {
    
    let server

    this.start = function({ port }) {    
        server = net.createServer( socket => {
            
            onClientConnected()
            
            socket.write( JSON.stringify("hardcoded message from server") +SEPARATOR)

            socket.on('data', message => onNewMessageFromClient(message, onMessage))    
            socket.on('end', onEnd)    
            socket.on('error', onError)    
        })

        server.on('close', onClose)
    
        server.listen(port)
    }

    this.close = function() {
        server.close()
    }
    
    function onNewMessageFromClient(message, onMessage) {
        String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))
            .forEach(message => onMessage(message))
    }
}

module.exports = TCPServer;