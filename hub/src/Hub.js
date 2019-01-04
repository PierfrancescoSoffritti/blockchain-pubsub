const net = require('net')
const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-interface')
const PersistentDataSourcePubSub = require('pubsub')
const Dispatcher = require('./Dispatcher')

const SEPARATOR = "$$SEP$$"
const connecetClients = {}

function Hub(hubId, persistendDataLayer) {
    const persistentPubSub = new PersistentDataSourcePubSub(hubId, persistendDataLayer)
    const clientDispatcher = new Dispatcher(connecetClients, SEPARATOR)

    const connection = await persistentPubSub.onNewMessage(message => clientDispatcher.dispatch(message) )
    listenForLocalClients(8900)

    function listenForLocalClients(port) {    
        const server = net.createServer( socket => {
            console.log("\nclient connected, waiting for client id...")
            let clientId
    
            socket.on('data', message => { onNewMessageFromClient(message) })
    
            socket.on('end', () => {
                console.log(`[${ clientId }] connection terminated`)
                delete connecetClients[clientId]
            })
    
            socket.on('error', () => {
                console.log(`[${ clientId }] connection error`)
                delete connecetClients[clientId]
            })
    
        })
    
        server.listen(port)
        
        console.log(`server running at port ${port}`)
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