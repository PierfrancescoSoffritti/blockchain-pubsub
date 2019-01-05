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
                const tClientId = onNewMessageFromClient(message)

                if(!clientId) {
                    clientId = tClientId
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
        let clientId

        String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => JSON.parse(message))
            .filter(message => message.isPersistent)
            .forEach(message => {
                clientId = message.senderId                
                persistentPubSub.sendMessage(message)
        })

        return clientId
    }
}

module.exports = Hub;