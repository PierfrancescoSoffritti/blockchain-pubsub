const expect = require('chai').expect
const PersistentDataSourcePubSub = require('../src/PersistentDataSourcePubSub')
const MockPersistentDataSource = require('./mocks/MockPersistentDataSource')

describe('sendMessage', () => {
    it('base test', async () => {
        
        // 1. ARRANGE
        const persistentData = new MockPersistentDataSource()
        const pubsub = new PersistentDataSourcePubSub(1, persistentData)

        // 2. ACT
        await pubsub.sendMessage("message #1")

        // 3. ASSERT
        expect(persistentData.getDataArray().length).to.be.equal(1)
    })
})