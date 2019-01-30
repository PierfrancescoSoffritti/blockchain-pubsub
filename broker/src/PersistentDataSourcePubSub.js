const MessageIdGenerator = require('./MessageIdGenerator')

function PersistentDataSourcePubSub(id, dataLayerAdapter, { topic = "MSG" } = { } ) {
    const messageIdGenerator = new MessageIdGenerator(topic)

    const onNewMessageListeners = []

    let lastSentMessageId = `${topic}0`
    let lastQueryMessageId = `${topic}0`

    const dataLayerSubscriptionPromise = subscribeToDataLayer()

    async function subscribeToDataLayer() {
        return await dataLayerAdapter.onDataPersisted(onNewPersistentDataAvailable)
    }

    this.sendMessage = async function(message) {        
        const newMessageId = messageIdGenerator.nextMessageId(lastSentMessageId)
        lastSentMessageId = newMessageId;

        await dataLayerAdapter.persist({ id: `${newMessageId}-${id}`, content: message })
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
        
        const response = await dataLayerAdapter.queryRange(queryLowerBound, queryUpperBound)

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