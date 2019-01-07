const net = require('net')
const dgram = require('dgram');
const PersistentDataSourcePubSub = require('pubsub')
const Dispatcher = require('./Dispatcher')

const SEPARATOR = "$$SEP$$"

function Hub(hubId, persistendDataLayer) {
    let server, UDPserver

    // maps clientId to { ip, port }
    const clientsGlobalMap = { }

    // maps clientId to socket
    const clientsLocalMap = {}

    const messagesPubSub = new PersistentDataSourcePubSub(hubId, persistendDataLayer, { topic: "MSG" })
    const clientsConnectionsPubSub = new PersistentDataSourcePubSub(hubId, persistendDataLayer, { topic: "CONNECTED" })

    const clientDispatcher = new Dispatcher(clientsLocalMap, SEPARATOR)

    let connectionsPubSubConnection, messagesPubSubConnection

    this.start = async function({ port }) {
        connectionsPubSubConnection = await clientsConnectionsPubSub.onNewMessage(message => clientsGlobalMap[message.clientId] = message.hubAddress)
        messagesPubSubConnection = await messagesPubSub.onNewMessage(message => clientDispatcher.dispatch(message))

        server = net.createServer( socket => onClientConnected(socket))    
        server.listen(port)
        UDPserver = startUDPServer()
    }

    this.close = function() {
        server.close()
        UDPserver.close()
        connectionsPubSubConnection.disconnect()
        messagesPubSubConnection.disconnect()
    }

    function onClientConnected(socket) {
        let clientId

        socket.on('data', message => {
            if(clientId) {
                onNewMessageFromClient(message)
            } else {
                clientId = getSenderId(message)
                
                if(clientsLocalMap[clientId]) {
                    socket.write( JSON.stringify(`A client with id ${clientId} is already connected`) +SEPARATOR )
                    socket.end()
                } else {
                    clientsLocalMap[clientId] = socket
                    clientsConnectionsPubSub.sendMessage({ clientId, hubAddress: { ip: "localhost", port: 9000 } }) // hardcoded address
                }
            }
        })    
        socket.on('end', () => delete clientsLocalMap[clientId] )
        socket.on('error', () => delete clientsLocalMap[clientId] )
    }
    
    function onNewMessageFromClient(message) {
        String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))
            .forEach(message => { 
                if(message.isPersistent) messagesPubSub.sendMessage(message)
                else sendNonPersistentMessage(message)
            })
    }

    function getSenderId(message) {
        const msg = String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))[0]

        return msg.senderId
    }

    function startUDPServer() {
        const server = dgram.createSocket('udp4')

        server.on('message', (message, remote) => {
            message = String(message)
            message = JSON.parse(message)
            clientDispatcher.dispatch(message)
        })

        server.bind(9000, "localhost") // hardcoded!

        return server
    }

    function sendNonPersistentMessage(message) {
        const messageBuffer = new Buffer(JSON.stringify(message))

        if(message.recipientId !== '*') {
            const { ip: hubIp, port: hubPort } = clientsGlobalMap[message.recipientId]
            sendUDPMessage(hubPort, hubIp, messageBuffer)
        } else {
            Object.keys(clientsGlobalMap).forEach(key => {
                const { ip: hubIp, port: hubPort } = clientsGlobalMap[key]                
                sendUDPMessage(hubPort, hubIp, messageBuffer)
            })
        }        
    }

    function sendUDPMessage(port, ip, buffer) {
        const client = dgram.createSocket('udp4')
        client.send(buffer, 0, buffer.length, port, ip, error => client.close() )
    }
}

module.exports = Hub;