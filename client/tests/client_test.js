const expect = require('chai').expect
const sinon = require('sinon')
const Client = require('../src/Client')
const { MockPersistentDataLayer, wait } = require('blockchain-pubsub-utils')
const { Hub } = require('blockchain-pubsub-hub')

describe('Client', () => {
    describe('connection', () => {
        it('succesfull connection test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client = new Client("client1")

            const onConnected = sinon.stub()

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client.connectToHub({ port: 8900, ip: "localhost"}).then(onConnected)

            client.disconnect()
            hub.close()

            // 3. ASSERT
            expect(onConnected.calledOnce).to.be.true
        })

        it('connect to wrong address test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client = new Client("client1")

            const onError = sinon.stub()

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client.connectToHub({ port: 8901, ip: "localhost"}).catch(onError)
            
            await wait(10)
            client.disconnect()
            hub.close()

            // 3. ASSERT
            expect(onError.calledOnce).to.be.true
        })
    })

    describe('publish', () => {
        it('throws if payload has wrong format test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client = new Client("client1")

            // 2. ACT
            // 3. ASSERT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client.connectToHub({ port: 8900, ip: "localhost"})

            expect( () => client.publish({ recipientId: "client1", isPersistent: true, message: { } }) ).to.throw()

            client.disconnect()
            hub.close()
        })
    })

    describe('publish-subscribe', () => {
        it('same client test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client = new Client("client1")

            const callback = sinon.stub()

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client.connectToHub({ port: 8900, ip: "localhost"})

            await wait(10)

            client.subscribe("event1", callback)
            client.publish({ recipientId: "client1", isPersistent: true, message: { name: "event1", content: "message #1" } })

            await wait(10)
            client.disconnect()
            hub.close()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
            expect(callback.calledWith("message #1")).to.be.true
        })

        it('separate clients (persistent message) test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client1 = new Client("client1")
            const client2 = new Client("client2")

            const callback = sinon.stub()

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client1.connectToHub({ port: 8900, ip: "localhost"})
            await client2.connectToHub({ port: 8900, ip: "localhost"})

            await wait(10)

            client2.subscribe("event1", callback)
            client1.publish({ recipientId: "client2", isPersistent: true, message: { name: "event1", content: "message #1" } })

            await wait(10)
            client1.disconnect()
            client2.disconnect()
            hub.close()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
            expect(callback.calledWith("message #1")).to.be.true
        })

        it('separate clients (non persistent message) test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const client1 = new Client("client1")
            const client2 = new Client("client2")

            const callback = sinon.stub()

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await client1.connectToHub({ port: 8900, ip: "localhost"})
            await client2.connectToHub({ port: 8900, ip: "localhost"})

            await wait(10)

            client2.subscribe("event1", callback)
            client1.publish({ recipientId: "client2", isPersistent: false, message: { name: "event1", content: "message #1" } })

            await wait(10)
            client1.disconnect()
            client2.disconnect()
            hub.close()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
            expect(callback.calledWith("message #1")).to.be.true
        })
    })
})