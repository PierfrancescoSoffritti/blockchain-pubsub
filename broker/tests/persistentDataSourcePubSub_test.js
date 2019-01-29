const expect = require('chai').expect
const sinon = require('sinon')
const PersistentDataSourcePubSub = require('../src/PersistentDataSourcePubSub')
const { MockPersistentDataLayer, wait } = require('blockchain-pubsub-utils')

describe('PersistentDataSourcePubSub', () => {
    describe('sendMessage', () => {
        it('base test', async () => {
            
            // 1. ARRANGE
            const pubsubId = 1
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentDatalayer)

            // 2. ACT
            await pubsub.sendMessage("message #1")

            // 3. ASSERT
            expect(persistentDatalayer.getDataArray().length).to.be.equal(1)
            expect(persistentDatalayer.getDataArray()[0].id).to.be.equal(`MSG1-${pubsubId}`)
            expect(persistentDatalayer.getDataArray()[0].content).to.be.equal(`message #1`)
        })

        it('multiple messages test', async () => {
            
            // 1. ARRANGE
            const pubsubId = 1
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentDatalayer)

            // 2. ACT
            await pubsub.sendMessage("message #1")
            await pubsub.sendMessage("message #2")
            await pubsub.sendMessage("message #3")

            // 3. ASSERT
            expect(persistentDatalayer.getDataArray().length).to.be.equal(3)
            expect(persistentDatalayer.getDataArray()[0].id).to.be.equal(`MSG1-${pubsubId}`)
            expect(persistentDatalayer.getDataArray()[0].content).to.be.equal(`message #1`)
            expect(persistentDatalayer.getDataArray()[1].id).to.be.equal(`MSG2-${pubsubId}`)
            expect(persistentDatalayer.getDataArray()[1].content).to.be.equal(`message #2`)
            expect(persistentDatalayer.getDataArray()[2].id).to.be.equal(`MSG3-${pubsubId}`)
            expect(persistentDatalayer.getDataArray()[2].content).to.be.equal(`message #3`)
        })

        it('multiple sources test', async () => {
            
            // 1. ARRANGE
            const pubsubId1 = 1
            const pubsubId2 = 2
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub1 = new PersistentDataSourcePubSub(pubsubId1, persistentDatalayer)
            const pubsub2 = new PersistentDataSourcePubSub(pubsubId2, persistentDatalayer)

            // 2. ACT
            await pubsub1.sendMessage("message #1")
            await pubsub2.sendMessage("message #2")
            await pubsub1.sendMessage("message #3")

            // 3. ASSERT
            expect(persistentDatalayer.getDataArray().length).to.be.equal(3)
            expect(persistentDatalayer.getDataArray()[0].id).to.be.equal(`MSG1-${pubsubId1}`)
            expect(persistentDatalayer.getDataArray()[0].content).to.be.equal(`message #1`)
            expect(persistentDatalayer.getDataArray()[1].id).to.be.equal(`MSG1-${pubsubId2}`)
            expect(persistentDatalayer.getDataArray()[1].content).to.be.equal(`message #2`)
            expect(persistentDatalayer.getDataArray()[2].id).to.be.equal(`MSG2-${pubsubId1}`)
            expect(persistentDatalayer.getDataArray()[2].content).to.be.equal(`message #3`)
        })
    })

    describe('onNewMessage', () => {
        it('base test', async () => {
            // 1. ARRANGE
            const pubsubId = 1
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentDatalayer)

            const onNewMessage = sinon.fake()
            pubsub.onNewMessage(onNewMessage)

            // 2. ACT
            await pubsub.sendMessage("message #1")

            // 3. ASSERT
            await wait(6)
            expect(onNewMessage.calledOnce).to.be.true
        })

        it('correct message is passed as argument test', async () => {
            // 1. ARRANGE
            const pubsubId = 1
            const persistentData = new MockPersistentDataLayer()
            const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentData)

            const callback = sinon.stub()
            pubsub.onNewMessage(callback)

            // 2. ACT
            await pubsub.sendMessage("message #1")

            // 3. ASSERT
            await wait(6)
            expect(callback.calledWith("message #1")).to.be.true
        })

        it('data is sorted test', async () => {
            // 1. ARRANGE
            const pubsubId1 = 1
            const pubsubId2 = 2
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub1 = new PersistentDataSourcePubSub(pubsubId1, persistentDatalayer)
            const pubsub2 = new PersistentDataSourcePubSub(pubsubId2, persistentDatalayer)

            const callback = sinon.stub()
            callback.withArgs("message #1").returns(1)
            callback.withArgs("message #2").returns(2)
            callback.withArgs("message #3").returns(3)
            callback.returns(-1)

            pubsub1.onNewMessage(callback)

            // 2. ACT
            await pubsub1.sendMessage("message #1")
            await pubsub1.sendMessage("message #3")
            await pubsub2.sendMessage("message #2")

            // 3. ASSERT
            await wait(6)
            expect(callback.returnValues).to.have.ordered.members([1, 2, 3])
        })

        it('only new data is emitted test', async () => {
            // 1. ARRANGE
            const pubsubId = 1
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentDatalayer)

            for(let i=0; i<5; i++) {
                // 1. ARRANGE
                let callback = sinon.stub()
                callback.withArgs("message #0").returns(0)
                callback.withArgs("message #1").returns(1)
                callback.withArgs("message #2").returns(2)
                callback.withArgs(`message #${i}`).returns(i)
                callback.returns(-1)
                pubsub.onNewMessage(callback)

                // 2. ACT
                await pubsub.sendMessage(`message #${i}`)

                // 3. ASSERT
                await wait(6)
                expect(callback.calledOnce).to.be.true
                expect(callback.returnValues).to.have.ordered.members([i])
            }

            expect(persistentDatalayer.getDataArray().length).to.be.equal(5)
        })

        it('only new data is emitted (two publishers) test', async () => {
            // 1. ARRANGE
            const pubsubId1 = 1
            const pubsubId2 = 2
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub1 = new PersistentDataSourcePubSub(pubsubId1, persistentDatalayer)
            const pubsub2 = new PersistentDataSourcePubSub(pubsubId2, persistentDatalayer)

            for(let i=0; i<5; i++) {
                // 1. ARRANGE
                let callback = sinon.stub()
                callback.withArgs("message #0").returns(0)
                callback.withArgs("message #1").returns(1)
                callback.withArgs("message #2").returns(2)
                callback.withArgs(`message #${i}`).returns(i)
                callback.returns(-1)
                pubsub1.onNewMessage(callback)

                // 2. ACT
                await pubsub1.sendMessage(`message #${i}`)
                await pubsub2.sendMessage(`message #${i}`)

                // 3. ASSERT
                await wait(6)
                expect(callback.calledTwice).to.be.true
                expect(callback.returnValues).to.have.ordered.members([i, i])
            }

            expect(persistentDatalayer.getDataArray().length).to.be.equal(10)
        })

        it('receives data only from topic of interest test', async () => {
            // 1. ARRANGE
            const persistentDatalayer = new MockPersistentDataLayer()
            const pubsub1 = new PersistentDataSourcePubSub(1, persistentDatalayer)
            const pubsub2 = new PersistentDataSourcePubSub(2, persistentDatalayer, { topic: "TEST" } )

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

            pubsub1.onNewMessage(callback1)
            pubsub2.onNewMessage(callback2)

            // 2. ACT
            await pubsub1.sendMessage("message #1")
            await pubsub2.sendMessage("message #2")

            // 3. ASSERT
            await wait(6)
            expect(callback1.returnValues).to.have.members([1])
            expect(callback2.returnValues).to.have.members([2])
        })
    })
})