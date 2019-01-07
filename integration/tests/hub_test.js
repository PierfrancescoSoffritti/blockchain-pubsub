const expect = require('chai').expect
const sinon = require('sinon')
const { TCPClient, wait } = require('blockchain-pubsub-utils')
const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const { Hub } = require('hub')

describe('Hub', function() {
    describe('connection', function() {
        it('base test', async function() {
            this.timeout(0)
            
            // 1. ARRANGE
            const onMessageReceived_sender = sinon.stub()
            const onMessageReceived_receiver = sinon.stub()

            const clientSender = new TCPClient(
                "clientSender",
                { onMessageReceived: onMessageReceived_sender }
            )

            const clientReceiver = new TCPClient(
                "clientReceiver",
                { onMessageReceived: onMessageReceived_receiver }
            )

            const hubId = await hyperledgerFabric.init("admin", "user1")
            const hub = new Hub(hubId, hyperledgerFabric)

            // 2. ACT
            hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            await wait(2000)

            await clientSender.connectTo({ port: 8900, ip: "localhost"})
            await clientReceiver.connectTo({ port: 8900, ip: "localhost"})

            clientSender.send({
                recipientId: "clientReceiver",
                isPersistent: true,
                payload: { aString: "sometext", aNum: 1, anObject: { prop1: "value", prop2: 1 } }
            })
            await wait(10000)

            clientSender.finish()
            clientReceiver.finish()
            hub.close()

            // 3. ASSERT
            expect(onMessageReceived_sender.notCalled).to.be.true;

            expect(onMessageReceived_receiver.calledOnce).to.be.true;
            expect(onMessageReceived_receiver.calledWith({
                senderId: "clientSender",
                recipientId: "clientReceiver",
                isPersistent: true,
                payload: { aString: "sometext", aNum: 1, anObject: { prop1: "value", prop2: 1 } }
            })).to.be.true
        })
    })
})