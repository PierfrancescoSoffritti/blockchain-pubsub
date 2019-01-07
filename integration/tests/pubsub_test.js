const expect = require('chai').expect
const sinon = require('sinon')
const PersistentDataSourcePubSub = require('pubsub')
const hyperledgerFabric = require('blockchain-pubsub-hyperledger-fabric-adapter')
const { wait } = require('blockchain-pubsub-utils')

describe('PersistentDataSourcePubSub', async function() {
    describe('onNewMessage', async function() {
        it('receives data only from topic of interest test', async function() {
            this.timeout(0)

            // 1. ARRANGE
            const callback1 = sinon.stub()
            callback1.withArgs("message #1").returns(1)
            callback1.withArgs("message #2").returns(2)
            callback1.withArgs("message #3").returns(3)
            callback1.returns(-1)

            const callback2 = sinon.stub()
            callback2.withArgs("message #1").returns(1)
            callback2.withArgs("message #2").returns(2)
            callback2.withArgs("message #3").returns(3)
            callback2.returns(-1)

            const hubId = await hyperledgerFabric.init("admin", "user1")

            const pubsub1 = new PersistentDataSourcePubSub(hubId, hyperledgerFabric, { topic: "TEST_ONE" })
            const pubsub2 = new PersistentDataSourcePubSub(hubId, hyperledgerFabric, { topic: "TEST_TWO" } )

            await wait(100)

            pubsub1.onNewMessage(callback1)
            pubsub2.onNewMessage(callback2)

            // 2. ACT
            await pubsub1.sendMessage("message #1")
            await pubsub2.sendMessage("message #2")

            await wait(100)

            // 3. ASSERT
            expect(callback1.returnValues).to.have.members([1])
            expect(callback2.returnValues).to.have.members([2])
        })
    })
})