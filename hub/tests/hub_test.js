const expect = require('chai').expect
const sinon = require('sinon')
const { MockPersistentDataLayer, TCPClient, wait } = require('blockchain-pubsub-utils')
const Hub = require('../src/Hub')

describe('Hub', () => {
    describe('can accept connections', () => {
        it('base test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
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

    describe('communication', () => {
        it('message delivered to same client through persistent data layer test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "client1",
                { onConnecting, onConnected, onConnectionClosed, onError, onMessageReceived }
            )

            // 2. ACT
            hub.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(5)
            tcpClient.send({ recipientId: "client1", isPersistent: true, payload: "message #1" })
            await wait(10)
            tcpClient.finish()
            hub.close()

            // 3. ASSERT
            expect(onMessageReceived.calledOnce).to.be.true;
            expect(onMessageReceived.calledWith({ senderId: "client1", recipientId: "client1", isPersistent: true, payload: "message #1" })).to.be.true
        })

        it('message delivered to different client through persistent data layer test', async () => {
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const tcpClientSender = new TCPClient(
                "clientSender",
                { }
            )

            const tcpClientReceiver = new TCPClient(
                "clientReceiver",
                { onConnecting, onConnected, onConnectionClosed, onError, onMessageReceived }
            )

            // 2. ACT
            hub.start({ port: 8900 })
            tcpClientSender.connectTo({ port: 8900, ip: "localhost"})
            tcpClientReceiver.connectTo({ port: 8900, ip: "localhost"})
            await wait(5)
            tcpClientSender.send({ recipientId: "clientReceiver", isPersistent: true, payload: "message #1" })
            await wait(10)
            tcpClientSender.finish()
            tcpClientReceiver.finish()
            hub.close()

            // 3. ASSERT
            expect(onMessageReceived.calledOnce).to.be.true;
            expect(onMessageReceived.calledWith({ senderId: "clientSender", recipientId: "clientReceiver", isPersistent: true, payload: "message #1" })).to.be.true
        })

    })
})