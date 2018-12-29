// const EnrollAdmin = require('./enrollAdmin')
// const RegisterUser = require('./registerUser')
// const Query = require('./query')
// const Invoke = require('./invoke')

const BlockchainPubSub = require('./index')

async function test() {

    const blockchain = new BlockchainPubSub()
    await blockchain.init()

    const connection = await blockchain.onNewMessage(message => console.log(`[TEST] new message: ${JSON.stringify(message)}`))
    setTimeout( () => connection.disconnect(), 8000)

    console.log("\n")

    await blockchain.query("MSG0", "MSG999")

    console.log("\n")

    await blockchain.sendMessage("test message")

    console.log("\n")

    await blockchain.query("MSG0", "MSG999")
    
    // const messages = await blockchain.queryNewMessages()
    // messages.forEach( m => console.log(`\n ${m.content}`))
}

test()