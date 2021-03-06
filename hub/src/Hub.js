const net = require('net')
const dgram = require('dgram');
const PubSub = require('blockchain-pubsub-pubsub')
const Dispatcher = require('./Dispatcher')

const SEPARATOR = "$$SEP$$"

function Hub(hubId, persistendDataLayer) {
    let hubDetails
    let TCPserver, UDPserver

    // maps clientId to { ip, port }
    const clientsGlobalMap = { }

    // maps clientId to socket
    const clientsLocalMap = {}

    const clientsConnectionsPubSub = new PubSub(hubId, persistendDataLayer, { topic: "CONNECTED" })
    const messagesPubSub = new PubSub(hubId, persistendDataLayer, { topic: "MSG" })
    
    let connectionsPubSubConnection
    let messagesPubSubConnection

    const clientDispatcher = new Dispatcher(clientsLocalMap, SEPARATOR)

    this.start = async function({ publicAddress, tcpPort, udpPort }) {
        hubDetails = { publicAddress, tcpPort, udpPort }

        TCPserver = startTCPServer(tcpPort)
        UDPserver = startUDPServer(udpPort)

        connectionsPubSubConnection = await clientsConnectionsPubSub.onNewMessage(message => clientsGlobalMap[message.clientId] = message.hubAddress)
        messagesPubSubConnection = await messagesPubSub.onNewMessage(message => clientDispatcher.dispatch(message))
    }

    this.close = function() {
        TCPserver.close()
        UDPserver.close()
        connectionsPubSubConnection.disconnect()
        messagesPubSubConnection.disconnect()
    }

    function startTCPServer(port) {
        const server = net.createServer( socket => onTCPClientConnected(socket))    
        server.listen(port)
        return server
    }

    function startUDPServer(port) {
        const server = dgram.createSocket('udp4')

        server.on('message', (message, remote) => {
            message = String(message)
            message = JSON.parse(message)
            clientDispatcher.dispatch(message)
        })

        server.bind(port, "localhost")

        return server
    }

    function onTCPClientConnected(socket) {
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
                    clientsConnectionsPubSub.sendMessage({ clientId, hubAddress: { ip: hubDetails.publicAddress, port: hubDetails.udpPort } })
                }
            }
        })    
        socket.on('end', () => delete clientsLocalMap[clientId] )
        socket.on('error', error => { delete clientsLocalMap[clientId]; console.error(error) } )
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

    function sendNonPersistentMessage(message) {
        const messageBuffer = new Buffer(JSON.stringify(message))

        if(message.recipientId !== '*') {
            const { ip: hubIp, port: hubPort } = clientsGlobalMap[message.recipientId]
            sendUDPMessage(hubPort, hubIp, messageBuffer)
        } else {
            const uniqueAddressesList = getUniqueValues(clientsGlobalMap)

            uniqueAddressesList.forEach(item => {
                const { ip: hubIp, port: hubPort } = item                
                sendUDPMessage(hubPort, hubIp, messageBuffer)
            })
        }        
    }

    function getUniqueValues(object) {
        const values = Object.keys(object).map(key => object[key])
        const set = new Set()
        const uniqueValues = values.filter(item => {
            if( set.has(JSON.stringify(item)) ) return false
            set.add(JSON.stringify(item))
            return true
        })

        return uniqueValues
    }

    function getSenderId(message) {
        const msg = String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))[0]

        return msg.senderId
    }

    function sendUDPMessage(port, ip, buffer) {
        const client = dgram.createSocket('udp4')
        client.send(buffer, 0, buffer.length, port, ip, error => client.close() )
    }
}

module.exports = Hub;