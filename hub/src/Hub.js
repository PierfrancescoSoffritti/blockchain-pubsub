const net = require('net')
const PersistentDataSourcePubSub = require('pubsub')
const Dispatcher = require('./Dispatcher')

const SEPARATOR = "$$SEP$$"
const connecetClients = {}

function Hub(hubId, persistendDataLayer) {
    const persistentPubSub = new PersistentDataSourcePubSub(hubId, persistendDataLayer)
    const clientDispatcher = new Dispatcher(connecetClients, SEPARATOR)

    const connection = await persistentPubSub.onNewMessage(message => clientDispatcher.dispatch(message))
    listenForLocalClients(8900)

    function listenForLocalClients(port) {    
        const server = net.createServer( socket => {
            let clientId

            socket.on('data', message => { onNewMessageFromClient(message) })    
            socket.on('end', () => { delete connecetClients[clientId] })    
            socket.on('error', () => { delete connecetClients[clientId] })    
        })
    
        server.listen(port)
    }
    
    function onNewMessageFromClient(message) {
        String(message)
            .split(SEPARATOR)
            .filter(string => string.trim().length !== 0)
            .map(message => { console.log(`\t[${clientId} IO] Message received: ${message}`); return message })
            .map(message => JSON.parse(message))
            .forEach(message => {  
    
                if(!clientId) {
                    clientId = message.senderId
                    connecetClients[clientId] = socket
                }
                
                persistentPubSub.sendMessage(message)
        })
    }
}