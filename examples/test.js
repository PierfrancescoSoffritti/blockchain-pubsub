const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-interface')
const BlockchainPubSub = require('pubsub')

async function test() {

    const hubId = await hyperledgerFabric.init("admin", "user1")

    const blockchainPubSub = new BlockchainPubSub(hubId, hyperledgerFabric)

    await wait(5000)

    const connection = await blockchainPubSub.onNewMessage(message => console.log(`[TEST] new message received: ${JSON.stringify(message)}`))
    // setTimeout( () => connection.disconnect(), 8000)

    await wait(5000)
    console.log("\n")

    await blockchainPubSub.sendMessage("message #1")

    await wait(5000)
    console.log("\n")

    await blockchainPubSub.sendMessage("message #2")

    await wait(5000)
    console.log("\n")

    await blockchainPubSub.sendMessage("message #3")

    await wait(5000)
    console.log("\n")

    // await blockchain.query("MSG0", "MSG999")
    
    // const messages = await blockchain.queryNewMessages()
    // messages.forEach( m => console.log(`\n ${m.content}`))
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test()