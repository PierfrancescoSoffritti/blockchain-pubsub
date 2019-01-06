const expect = require('chai').expect
const sinon = require('sinon')
const { wait } = require('blockchain-pubsub-utils')
const hyperledgerAdapater = require('../index')

describe('Hub', function() {
    describe('connection', function() {
        it('base test', async function() {
            this.timeout(0);
            
            // 1. ARRANGE
            await hyperledgerAdapater.init("admin", "user1")

            // 2. ACT
            await hyperledgerAdapater.persist( { id: "test_ID1", content: { aString: "message #1", aNumber: 1 } } )

            // await wait(2000)

            // 3. ASSERT
            const result = await hyperledgerAdapater.queryRange("test_ID0", "test_ID9")

            expect(result.length).to.be.equal(1)
            expect(result[0]).to.have.property("id", "test_ID1")
            expect(result[0]).to.have.property("content")

            const content = result[0].content

            expect(content).to.have.property("aString", "message #1")
            expect(content).to.have.property("aNumber", 1)
        })
    })
})