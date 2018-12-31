const MessageIdGenerator = require('./MessageIdGenerator')

function PersistentDataSourcePubSub(hubId, persistentDataSource) {
    let onNewMessage = () => {}

    let lastSentMessageId = "MSG0"
    let lastQueryMessageId = "MSG0"

    this.sendMessage = async function(message) {        
        const newMessageId = MessageIdGenerator.nextMessageId(lastSentMessageId)
        lastSentMessageId = newMessageId;

        await persistentDataSource.persist( { id: `${newMessageId}-${hubId}`, content: message } )
    }

    this.onNewMessage = async function(messageListener) {
        onNewMessage = messageListener
        
        const listenerConnection = await persistentDataSource.onDataPersisted(onNewPersistentDataAvailable)
        return listenerConnection
    }

    async function onNewPersistentDataAvailable() { 
        const messages = await queryNewMessages(lastQueryMessageId)
        messages.forEach( message => onNewMessage(message) )
    }

    async function queryNewMessages(queryLowerBound = lastQueryMessageId) {       
        const queryUpperBound = MessageIdGenerator.addOffset(queryLowerBound, 10)
        
        const response = await persistentDataSource.queryRange(queryLowerBound, queryUpperBound)

        if(response.length === 0)
            return []

        const messages = response
            .sort( (r1, r2) => MessageIdGenerator.compare(r1.id.split('-')[0], r2.id.split('-')[0]))
            .map( object => object.content )

        const lastId = response[response.length-1].id
        const keyMessageId = lastId.split('-')[0]
        lastQueryMessageId = MessageIdGenerator.nextMessageId(keyMessageId)
       
        return messages
    }
}

module.exports = PersistentDataSourcePubSub