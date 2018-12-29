// const EnrollAdmin = require('./enrollAdmin')
// const RegisterUser = require('./registerUser')
// const Query = require('./query')
// const Invoke = require('./invoke')

const BlockchainPubSub = require('./index')

async function test() {

    const blockchain = new BlockchainPubSub()
    await blockchain.init()

    await wait(10000)

    const connection = await blockchain.onNewMessage(message => console.log(`[TEST] new message received: ${JSON.stringify(message)}`))
    // setTimeout( () => connection.disconnect(), 8000)

    console.log("\n")

    // const queryRes = await blockchain.query("MSG0", "MSG999")
    // console.log("[TEST] query result: " +queryRes)

    await wait(10000)

    console.log("\n")

    await blockchain.sendMessage("message #1")

    await wait(10000)

    console.log("\n")

    await blockchain.sendMessage("message #2")

    await wait(10000)

    await blockchain.sendMessage("message #3")

    console.log("\n")

    // await blockchain.query("MSG0", "MSG999")
    
    // const messages = await blockchain.queryNewMessages()
    // messages.forEach( m => console.log(`\n ${m.content}`))
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test()