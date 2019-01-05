const expect = require('chai').expect
const sinon = require('sinon')
const { MockPersistentDataSource, TCPClient, wait } = require('blockchain-pubsub-utils')
const Hub = require('../src/Hub')

describe('Hub', () => {
    describe('can accept connections', () => {
        it('base test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataSource()
            const hub = new Hub("hub0", datalayer)

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting, onConnected, onConnectionClosed, onError, onMessageReceived }
            )

            // 2. ACT
            hub.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(10)
            tcpClient.finish()
            hub.close()

            // 3. ASSERT
            expect(onConnecting.calledOnce).to.be.true
            expect(onConnected.calledOnce).to.be.true
        })
    })

    // describe('communication', () => {
    //     it('persistent message is persisted test', async () => {
            
    //         // 1. ARRANGE
    //         const datalayer = new MockPersistentDataSource()
    //         const hub = new Hub("hub0", datalayer)

    //         const onConnecting = sinon.stub()
    //         const onConnected = sinon.stub()
    //         const onConnectionClosed = sinon.stub()
    //         const onError = sinon.stub()
    //         const onMessageReceived = sinon.stub()

    //         const tcpClient = new TCPClient(
    //             "clientId",
    //             { onConnecting, onConnected, onConnectionClosed, onError, onMessageReceived }
    //         )
            
    //         const onDataPersisted = sinon.stub()
    //         await datalayer.onDataPersisted(onDataPersisted)

    //         // 2. ACT
    //         hub.start({ port: 8900 })
    //         tcpClient.connectTo({ port: 8900, ip: "localhost"})
    //         tcpClient.send({ senderId: "senderId", recipientId: "recipientId", isPersistent: true, payload: "message #1" })
    //         tcpClient.finish()
    //         hub.close()
    //         await wait(4)

    //         // 3. ASSERT
    //         expect(onDataPersisted.calledOnce).to.be.true;
    //         expect(onDataPersisted.calledWith({ senderId: "senderId", recipientId: "recipientId", isPersistent: true, payload: "message #1" })).to.be.true
    //     })

        // it('non persistent message is not persisted test', async () => {
        // })

    // })
})