const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const { Hub } = require('hub')
const { TCPClient, wait } = require('blockchain-pubsub-utils')

async function test() {

    const hubId = await hyperledgerFabric.init("admin", "user1")
    const hub = new Hub(hubId, hyperledgerFabric)

    const tcpClient1 = new TCPClient(
        "client1",
        { onMessageReceived: message => { console.log(`[CLIENT1] message received ${message}`) } }
    )

    const tcpClient2 = new TCPClient(
        "client2",
        { onMessageReceived: message => { console.log(`[CLIENT2] message received ${message}`) } }
    )

    hub.start({ port: 8900 })

    await wait(100)
    console.log("hub started")

    tcpClient1.connectTo({ port: 8900, ip: "localhost"})
    console.log("client1 started")
    
    tcpClient2.connectTo({ port: 8900, ip: "localhost"})
    console.log("client2 started")
    
    await wait(100)

    tcpClient1.send({ recipientId: "client2", isPersistent: true, payload: "message #1" })
    console.log("message sent")

    await wait(100)

    tcpClient1.finish()
    tcpClient2.finish()
    // hub.close()
}

test()