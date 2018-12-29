const EnrollAdmin = require('./enrollAdmin')
const RegisterUser = require('./registerUser')
const Query = require('./query')
const Invoke = require('./invoke')

function BlockchainPubSub() {
    const userName = "user1"
    let userPublicKey
    let onNewMessage

    let lastQueryMessageNumber = "MSG0"

    const blockchainListener = BlockchainListener(userName)
    blockchainListener.onNewBlock( async newBlock => { 
        if(onNewMessage) {
            const messages = await queryNewMessages(lastQueryMessageNumber)
            messages.forEach( message => onNewMessage(message) )
        }
    } )

    this.init = async function() {
        await EnrollAdmin("admin")
        const user = await RegisterUser(userName)
        
        userPublicKey = user.getIdentity()._publicKey._key.pubKeyHex
        initDone = true
    }

    this.sendMessage = async function(message) {
        if(!initDone) {
            console.error("init not done")
            return
        }
        
        await Invoke(userName, {id: `MSG1-${userPublicKey}`, content: message})
    }

    this.query = async function(queryLowerBound, queryUpperBound) {
        return await Query(userName, queryLowerBound, queryUpperBound)
    }

    this.addMessageListener = function(messageListener) {
        onNewMessage = messageListener
    }

    async function queryNewMessages(queryLowerBound) {
        /*
        response format:  [ {"Key": "MSG0-publicKey", "Record": { "content": "message content", "senderId": "testSender" } } ]
        */
       
        const queryUpperBound = "MSG" +( Number(queryLowerBound.split("MSG")[0]) + 999 )

        const response = await Query(userName, queryLowerBound, queryUpperBound)
        const messages = response.map( r => r["Record"] )

        const lastKey = response[response.length-1]["Key"]
        lastQueryMessageNumber = lastKey.split('-')[0]
       
        return messages
    }
}