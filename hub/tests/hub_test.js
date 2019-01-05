const expect = require('chai').expect
const sinon = require('sinon')
const MockPersistentDataSource = require('../src/MockPersistentDataSource')
const { wait } = require('../src/utils')

describe('Hub', () => {
    describe('persist', () => {
        it('persisted message is persisted test', () => {
            
            // 1. ARRANGE
            const datasource = new MockPersistentDataSource()

            // 2. ACT
            datasource.persist({ id: "MSG0", content: "message #1" })

            // 3. ASSERT
            expect(datasource.data["MSG0"]).to.be.equal("message #1")
        })

        it('not persisted message is not persisted test', () => {
            
            // 1. ARRANGE
            const datasource = new MockPersistentDataSource()

            // 2. ACT

            // 3. ASSERT
            expect(datasource.data["MSG0"]).to.be.undefined
        })
    })
})