const MessageIdGenerator = require('./MessageIdGenerator')

function PersistentDataSourcePubSub(hubId, persistentDataLayer, { messagesIdPrefix = "MSG" } = { } ) {
    const messageIdGenerator = new MessageIdGenerator(messagesIdPrefix)

    const onNewMessageListeners = []

    let lastSentMessageId = `${messagesIdPrefix}0`
    let lastQueryMessageId = `${messagesIdPrefix}0`

    const dataLayerSubscriptionPromise = subscribeToDataLayer()

    async function subscribeToDataLayer() {
        return await persistentDataLayer.onDataPersisted(onNewPersistentDataAvailable)
    }

    this.sendMessage = async function(message) {        
        const newMessageId = messageIdGenerator.nextMessageId(lastSentMessageId)
        lastSentMessageId = newMessageId;

        await persistentDataLayer.persist( { id: `${newMessageId}-${hubId}`, content: message } )
    }

    this.onNewMessage = async function(messageListener) {
        onNewMessageListeners.push(messageListener)
        return await dataLayerSubscriptionPromise
    }

    async function onNewPersistentDataAvailable() { 
        const messages = await queryNewMessages(lastQueryMessageId)
        messages.forEach( message => onNewMessageListeners.forEach( listener => listener(message) ) )
    }

    async function queryNewMessages(queryLowerBound = lastQueryMessageId) {       
        const queryUpperBound = messageIdGenerator.addOffset(queryLowerBound, 10)
        
        const response = await persistentDataLayer.queryRange(queryLowerBound, queryUpperBound)

        if(response.length === 0)
            return []

        const messages = response
            .sort( (r1, r2) => messageIdGenerator.compare(r1.id.split('-')[0], r2.id.split('-')[0]))
            .map( object => object.content )

        const lastId = response[response.length-1].id
        const keyMessageId = lastId.split('-')[0]
        lastQueryMessageId = messageIdGenerator.nextMessageId(keyMessageId)
       
        return messages
    }
}

module.exports = PersistentDataSourcePubSub