const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const PersistentDataSourcePubSub = require('pubsub')
const { wait } = require('blockchain-pubsub-utils')

async function test() {

    const hubId = await hyperledgerFabric.init("admin", "user1")

    const pubsub1 = new PersistentDataSourcePubSub(hubId, hyperledgerFabric, { topic: "TOPIC_ONE" })
    const pubsub2 = new PersistentDataSourcePubSub(hubId, hyperledgerFabric, { topic: "TOPIC_TWO" })

    await wait(100)

    const connection1 = await pubsub1.onNewMessage(message => console.log(`[TOPIC_ONE] new message received: ${JSON.stringify(message)}`))
    const connection2 = await pubsub2.onNewMessage(message => console.log(`[TOPIC_TWO] new message received: ${JSON.stringify(message)}`))

    await wait(100)
    console.log("\n")

    await pubsub1.sendMessage("message #1")

    await wait(100)
    console.log("\n")

    await pubsub2.sendMessage("message #2")

    await wait(100)
    console.log("\n")

    const resTopicOne = await hyperledgerFabric.queryRange("TOPIC_ONE0", "TOPIC_ONE999")
    const resTopicTwo = await hyperledgerFabric.queryRange("TOPIC_TWO0", "TOPIC_TWO999")

    console.log(`[TOPIC_ONE query res]: ${JSON.stringify(resTopicOne)}`)
    console.log(`[TOPIC_TWO query res]: ${JSON.stringify(resTopicTwo)}`)

    await wait(100)
    console.log("\n")
    
    connection1.disconnect()
    connection2.disconnect()
}

test()