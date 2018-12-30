const expect = require('chai').expect
const sinon = require('sinon')
const PersistentDataSourcePubSub = require('../src/PersistentDataSourcePubSub')
const MockPersistentDataSource = require('./mocks/MockPersistentDataSource')
const { wait } = require('./utils')

describe('sendMessage', () => {
    it('base test', async () => {
        
        // 1. ARRANGE
        const pubsubId = 1
        const persistentData = new MockPersistentDataSource()
        const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentData)

        // 2. ACT
        await pubsub.sendMessage("message #1")

        // 3. ASSERT
        expect(persistentData.getDataArray().length).to.be.equal(1)
        expect(persistentData.getDataArray()[0].id).to.be.equal(`MSG0-${pubsubId}`)
        expect(persistentData.getDataArray()[0].content).to.be.equal(`message #1`)
    })

    it('multiple messages test', async () => {
        
        // 1. ARRANGE
        const pubsubId = 1
        const persistentData = new MockPersistentDataSource()
        const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentData)

        // 2. ACT
        await pubsub.sendMessage("message #1")
        await pubsub.sendMessage("message #2")
        await pubsub.sendMessage("message #3")

        // 3. ASSERT
        expect(persistentData.getDataArray().length).to.be.equal(3)
        expect(persistentData.getDataArray()[0].id).to.be.equal(`MSG0-${pubsubId}`)
        expect(persistentData.getDataArray()[0].content).to.be.equal(`message #1`)
        expect(persistentData.getDataArray()[1].id).to.be.equal(`MSG1-${pubsubId}`)
        expect(persistentData.getDataArray()[1].content).to.be.equal(`message #2`)
        expect(persistentData.getDataArray()[2].id).to.be.equal(`MSG2-${pubsubId}`)
        expect(persistentData.getDataArray()[2].content).to.be.equal(`message #3`)
    })

    it('multiple sources test', async () => {
        
        // 1. ARRANGE
        const pubsubId1 = 1
        const pubsubId2 = 2
        const persistentData = new MockPersistentDataSource()
        const pubsub1 = new PersistentDataSourcePubSub(pubsubId1, persistentData)
        const pubsub2 = new PersistentDataSourcePubSub(pubsubId2, persistentData)

        // 2. ACT
        await pubsub1.sendMessage("message #1")
        await pubsub2.sendMessage("message #2")
        await pubsub1.sendMessage("message #3")

        // 3. ASSERT
        expect(persistentData.getDataArray().length).to.be.equal(3)
        expect(persistentData.getDataArray()[0].id).to.be.equal(`MSG0-${pubsubId1}`)
        expect(persistentData.getDataArray()[0].content).to.be.equal(`message #1`)
        expect(persistentData.getDataArray()[1].id).to.be.equal(`MSG0-${pubsubId2}`)
        expect(persistentData.getDataArray()[1].content).to.be.equal(`message #2`)
        expect(persistentData.getDataArray()[2].id).to.be.equal(`MSG1-${pubsubId1}`)
        expect(persistentData.getDataArray()[2].content).to.be.equal(`message #3`)
    })
})

describe('onNewMessage', () => {
    it('base test', async () => {
        // 1. ARRANGE
        const pubsubId = 1
        const persistentData = new MockPersistentDataSource()
        const pubsub = new PersistentDataSourcePubSub(pubsubId, persistentData)

        const onNewMessage = sinon.fake()
        pubsub.onNewMessage(onNewMessage)

        // 2. ACT
        await pubsub.sendMessage("message #1")

        // 3. ASSERT
        await wait(6)
        expect(onNewMessage.calledOnce).to.be.true;
    })

    it('correct message is passed as argument test', async () => {
        // 1. ARRANGE
        const pubsubId = 1
        const persistentData = new MockPersistentDataSource()
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
        const persistentData = new MockPersistentDataSource()
        const pubsub1 = new PersistentDataSourcePubSub(pubsubId1, persistentData)
        const pubsub2 = new PersistentDataSourcePubSub(pubsubId2, persistentData)

        const callback = sinon.stub()
        callback.withArgs("message #1").returns(1)
        callback.withArgs("message #2").returns(2)
        callback.withArgs("message #3").returns(3)
        callback.returns(0)

        pubsub1.onNewMessage(callback)

        // 2. ACT
        await pubsub1.sendMessage("message #1")
        await pubsub1.sendMessage("message #3")
        await pubsub2.sendMessage("message #2")

        // 3. ASSERT
        await wait(6)
        expect(callback.returnValues).to.have.ordered.members([1, 2, 3]);
    })
})