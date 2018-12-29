const EnrollAdmin = require('./enrollAdmin')
const RegisterUser = require('./registerUser')
const Query = require('./query')
const Invoke = require('./invoke')
const addNewBlockEventListener = require('./BlockchainListener')
const MessageIdGenerator = require('./MessageIdGenerator')

function BlockchainPubSub() {
    const self = this

    const userName = "user2"
    let initCompleted = false;
    let userPublicKey
    let onNewMessage = () => {}

    let lastSentMessageId = "MSG0"
    let lastQueryMessageId = "MSG0"

    async function newBlockReceived(newBlock) { 
        const messages = await self.queryNewMessages(lastQueryMessageId)
        messages.forEach( message => onNewMessage(message) )
    }

    this.init = async function() {
        await EnrollAdmin("admin")
        const user = await RegisterUser(userName)
        
        // only for debug
        // if(user)
        //     userPublicKey = user.getIdentity()._publicKey._key.pubKeyHex
        // else
            userPublicKey = `${userName}_publicKey`

        initCompleted = true
    }

    this.sendMessage = async function(message) {
        if(!initCompleted)
            throw "Init not completed"
        
        const newMessageId = MessageIdGenerator.nextMessageId(lastSentMessageId)
        console.log("[INDEX] sendMessage, id: " +newMessageId)
        lastSentMessageId = newMessageId;

        await Invoke(userName, {id: `${newMessageId}-${userPublicKey}`, content: message})
    }

    this.query = async function(queryLowerBound, queryUpperBound) {
        if(!initCompleted)
            throw "Init not completed"

        return await Query(userName, queryLowerBound, queryUpperBound)
    }

    this.onNewMessage = async function(messageListener) {
        if(!initCompleted)
            throw "Init not completed"

        onNewMessage = messageListener
        
        const blockListenerConnection = await addNewBlockEventListener(userName, newBlockReceived)
        return blockListenerConnection
    }

    this.queryNewMessages = async function(queryLowerBound = lastQueryMessageId) {
        if(!initCompleted)
            throw "Init not completed"

        /*
        response format:  [ {"Key": "MSG0-publicKey", "Record": { "content": "message content", "senderId": "testSender" } } ]
        */
       
        const queryUpperBound = MessageIdGenerator.addOffset(queryLowerBound, 999)

        console.log("[INDEX] queryNewMessages lower bound: " +queryLowerBound)
        console.log("[INDEX] queryNewMessages upper bound: " +queryUpperBound +"\n")

        const stringResponse = await Query(userName, queryLowerBound, queryUpperBound)
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