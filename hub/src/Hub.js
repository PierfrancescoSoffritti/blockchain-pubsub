const net = require('net')
const PersistentDataSourcePubSub = require('pubsub')
const Dispatcher = require('./Dispatcher')

const SEPARATOR = "$$SEP$$"
const connecetClients = {}

function Hub(hubId, persistendDataLayer) {
    let server

    const persistentPubSub = new PersistentDataSourcePubSub(hubId, persistendDataLayer)
    const clientDispatcher = new Dispatcher(connecetClients, SEPARATOR)

    let persistendPubSubConnection

    this.start = async function({ port }) {

        persistendPubSubConnection = await persistentPubSub.onNewMessage(message => clientDispatcher.dispatch(message))

        server = net.createServer( socket => {
            let clientId

            socket.on('data', message => {
                if(clientId) {
                    onNewMessageFromClient(message)
                } else {
                    clientId = getSenderId(message)
                    connecetClients[clientId] = socket
                }
            })    
            socket.on('end', () => { delete connecetClients[clientId] })    
            socket.on('error', () => { delete connecetClients[clientId] })    
        })
    
        server.listen(port)
    }

    this.close = function() {
        server.close()
        persistendPubSubConnection.disconnect()
    }
    
    function onNewMessageFromClient(message) {
        String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))
            .filter(message => message.isPersistent)
            .forEach(message => persistentPubSub.sendMessage(message))
    }

    function getSenderId(message) {
        const msg = String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))[0]

        return msg.senderId
    }
}

module.exports = Hub;