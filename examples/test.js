const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const PersistentDataSourcePubSub = require('pubsub')

async function test() {

    const hubId = await hyperledgerFabric.init("admin", "user1")

    const persistentPubSub = new PersistentDataSourcePubSub(hubId, hyperledgerFabric)

    await wait(2000)

    const connection = await persistentPubSub.onNewMessage(message => console.log(`[TEST] new message received: ${JSON.stringify(message)}`))
    // setTimeout( () => connection.disconnect(), 8000)

    await wait(2000)
    console.log("\n")

    await persistentPubSub.sendMessage("message #1")

    await wait(2000)
    console.log("\n")

    await persistentPubSub.sendMessage("message #2")

    await wait(2000)
    console.log("\n")

    await persistentPubSub.sendMessage("message #3")
    await persistentPubSub.sendMessage("message #4")
    await persistentPubSub.sendMessage("message #5")
    await persistentPubSub.sendMessage("message #6")

    await wait(2000)
    console.log("\n")

    // await blockchain.query("MSG0", "MSG999")
    
    // const messages = await blockchain.queryNewMessages()
    // messages.forEach( m => console.log(`\n ${m.content}`))
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test()