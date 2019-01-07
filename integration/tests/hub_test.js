const expect = require('chai').expect
const sinon = require('sinon')
const { MockPersistentDataLayer, TCPClient, wait } = require('blockchain-pubsub-utils')
const Hub = require('../../hub/src/Hub')

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
            hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(10)
            tcpClient.finish()
            hub.close()

            // 3. ASSERT
            expect(onConnecting.calledOnce).to.be.true
            expect(onConnected.calledOnce).to.be.true
        })
    })
})