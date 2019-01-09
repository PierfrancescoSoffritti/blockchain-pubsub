const expect = require('chai').expect
const sinon = require('sinon')
const { wait } = require('blockchain-pubsub-utils')
const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const { Hub } = require('blockchain-pubsub-hub')
const { Client } = require('blockchain-pubsub-client')

describe('Client', function() {
    describe('connection', function() {
        it('base test', async function() {
            this.timeout(0)
            
            // 1. ARRANGE
            const callback = sinon.stub()

            const client1 = new Client("client1")
            const client2 = new Client("client2")

            const hubId = await hyperledgerFabric.init("admin", "user1")
            const hub = new Hub(hubId, hyperledgerFabric)

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })

            await client1.connectToHub({ port: 8900, ip: "localhost"})
            await client2.connectToHub({ port: 8900, ip: "localhost"})
            
            await wait(100)

            client2.subscribe("event1", callback)

            client1.publish({
                recipientId: "client2",
                isPersistent: true,
                message: { name: "event1", content: { prop1: "value", prop2: 1 } }
            })
            await wait(10000)

            client1.disconnect()
            client2.disconnect()
            hub.close()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
            expect(callback.calledWith({ prop1: "value", prop2: 1 })).to.be.true
        })
    })
})