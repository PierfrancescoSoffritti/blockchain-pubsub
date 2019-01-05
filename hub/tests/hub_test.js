const expect = require('chai').expect
const sinon = require('sinon')
const { MockPersistentDataLayer, TCPClient, wait } = require('blockchain-pubsub-utils')
const Hub = require('../src/Hub')

describe('Hub', () => {
    describe('connection', () => {
        it('base test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting, onConnected }
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

        it('disconnect when connecting multiple clients with same id test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onConnecting1 = sinon.stub()
            const onConnected1 = sinon.stub()
            const onConnectionClosed1 = sinon.stub()

            const onConnecting2 = sinon.stub()
            const onConnected2 = sinon.stub()
            const onConnectionClosed2 = sinon.stub()

            const tcpClient1 = new TCPClient(
                "clientId",
                { onConnecting: onConnecting1, onConnected: onConnected1, onConnectionClosed: onConnectionClosed1 }
            )

            const tcpClient2 = new TCPClient(
                "clientId",
                { onConnecting: onConnecting2, onConnected: onConnected2, onConnectionClosed: onConnectionClosed2 }
            )

            // 2. ACT
            hub.start({ port: 8900 })
            await wait(10)
            tcpClient1.connectTo({ port: 8900, ip: "localhost" })
            tcpClient2.connectTo({ port: 8900, ip: "localhost" })
            await wait(10)
            tcpClient1.finish()
            tcpClient2.finish()
            hub.close()

            // 3. ASSERT
            expect(onConnecting1.calledOnce).to.be.true
            expect(onConnected1.calledOnce).to.be.true
            expect(onConnectionClosed1.notCalled).to.be.true

            expect(onConnecting2.calledOnce).to.be.true
            expect(onConnected2.calledOnce).to.be.true
            expect(onConnectionClosed2.calledOnce).to.be.true
        })
    })

    describe('communication', () => {
        it('message delivered to same client through persistent data layer test', async () => {
            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "client1",
                { onMessageReceived }
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

            const onMessageReceived_sender = sinon.stub()
            const onMessageReceived_receiver = sinon.stub()

            const tcpClientSender = new TCPClient(
                "clientSender",
                { onMessageReceived: onMessageReceived_sender }
            )

            const tcpClientReceiver = new TCPClient(
                "clientReceiver",
                { onMessageReceived: onMessageReceived_receiver }
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
            expect(onMessageReceived_sender.notCalled).to.be.true;

            expect(onMessageReceived_receiver.calledOnce).to.be.true;
            expect(onMessageReceived_receiver.calledWith({ senderId: "clientSender", recipientId: "clientReceiver", isPersistent: true, payload: "message #1" })).to.be.true
        })

        it('broadcast message delivered to every client test', async () => {
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)

            const onMessageReceived1 = sinon.stub()
            const onMessageReceived2 = sinon.stub()

            const tcpClient1 = new TCPClient(
                "client1",
                { onMessageReceived: onMessageReceived1 }
            )

            const tcpClient2 = new TCPClient(
                "client2",
                { onMessageReceived: onMessageReceived2 }
            )

            // 2. ACT
            hub.start({ port: 8900 })
            tcpClient1.connectTo({ port: 8900, ip: "localhost"})
            tcpClient2.connectTo({ port: 8900, ip: "localhost"})
            await wait(5)
            tcpClient1.send({ recipientId: "*", isPersistent: true, payload: "message #1" })
            await wait(10)
            tcpClient1.finish()
            tcpClient2.finish()
            hub.close()

            // 3. ASSERT
            expect(onMessageReceived1.calledOnce).to.be.true;
            expect(onMessageReceived1.calledWith({ senderId: "client1", recipientId: "*", isPersistent: true, payload: "message #1" })).to.be.true

            expect(onMessageReceived2.calledOnce).to.be.true;
            expect(onMessageReceived2.calledWith({ senderId: "client1", recipientId: "*", isPersistent: true, payload: "message #1" })).to.be.true
        })
    })
})