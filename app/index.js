const MessageIdGenerator = require('./MessageIdGenerator')

function BlockchainPubSub(hubId, blockchain) {
    const self = this

    let onNewMessage = () => {}

    let lastSentMessageId = "MSG0"
    let lastQueryMessageId = "MSG0"

    async function onNewBlockReceived(newBlock) { 
        const messages = await self.queryNewMessages(lastQueryMessageId)
        messages.forEach( message => onNewMessage(message) )
    }

    this.sendMessage = async function(message) {        
        const newMessageId = MessageIdGenerator.nextMessageId(lastSentMessageId)
        console.log("[INDEX] sendMessage, id: " +newMessageId)
        lastSentMessageId = newMessageId;

        await blockchain.invoke( { id: `${newMessageId}-${hubId}`, content: message } )
    }

    this.query = async function(queryLowerBound, queryUpperBound) {
        return await blockchain.query(queryLowerBound, queryUpperBound)
    }

    this.onNewMessage = async function(messageListener) {
        onNewMessage = messageListener
        
        const blockListenerConnection = await blockchain.addNewBlockEventListener(onNewBlockReceived)
        return blockListenerConnection
    }

    this.queryNewMessages = async function(queryLowerBound = lastQueryMessageId) {
        /*
        response format:  [ {"Key": "MSG0-publicKey", "Record": { "content": "message content", "senderId": "testSender" } } ]
        */
       
        const queryUpperBound = MessageIdGenerator.addOffset(queryLowerBound, 999)

        console.log("[INDEX] queryNewMessages lower bound: " +queryLowerBound)
        console.log("[INDEX] queryNewMessages upper bound: " +queryUpperBound +"\n")

        const stringResponse = await blockchain.query(queryLowerBound, queryUpperBound)
        const response = JSON.parse(stringResponse)

        console.log(`[INDEX] response.length: ${response.length}`)
        if(response.length === 0)
            return []

        const messages = response
            .sort( (r1, r2) => MessageIdGenerator.compare(r1["Key"].split('-')[0], r2["Key"].split('-')[0]))
            .map( r => { console.log("[INDEX] queryNewMessages key: " +r["Key"]); return r } )
            .map( r => r["Record"] )

        const lastKey = response[response.length-1]["Key"]
        const keyMessageId = lastKey.split('-')[0]
        lastQueryMessageId = MessageIdGenerator.nextMessageId(keyMessageId)
       
        return messages
    }
}

module.exports = BlockchainPubSub