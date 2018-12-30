const expect = require('chai').expect
const sinon = require('sinon')
const MockPersistentDataSource = require('./MockPersistentDataSource')
const { wait } = require('../utils')

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

describe('queryRange', () => {
    it('data is in range test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        datasource.data["MSG0"] = "message #1"

        // 2. ACT
        const res = await datasource.queryRange("MSG0", "MSG99")

        // 3. ASSERT
        expect(res[0].id).to.be.equal("MSG0")
        expect(res[0].content).to.be.equal("message #1")
    })

    it('data is out of lower range test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        datasource.data["MSG0"] = "message #1"

        // 2. ACT
        const res = await datasource.queryRange("MSG1", "MSG99")

        // 3. ASSERT
        expect(res.length).to.be.equal(0)
    })

    it('data is out of upper range test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        datasource.data["MSG100"] = "message #1"

        // 2. ACT
        const res = await datasource.queryRange("MSG0", "MSG99")

        // 3. ASSERT
        expect(res.length).to.be.equal(0)
    })

    it('multiple results test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        datasource.data["MSG0"] = "message #1"
        datasource.data["MSG0"] = "message #2"
        datasource.data["MSG1"] = "message #3"

        // 2. ACT
        const res = await datasource.queryRange("MSG0", "MSG99")

        // 3. ASSERT
        expect(res.length).to.be.equal(2)
        expect(res[0].id).to.be.equal("MSG0")
        expect(res[0].content).to.be.equal("message #2")
        expect(res[1].id).to.be.equal("MSG1")
        expect(res[1].content).to.be.equal("message #3")
    })
})

describe('onDataPersisted', () => {
    it('listener called once test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        const onDataPersisted = sinon.fake()
        await datasource.onDataPersisted(onDataPersisted)

        // 2. ACT
        datasource.persist({ id: "MSG0", content: "message #1" })
        datasource.persist({ id: "MSG1", content: "message #2" })
        datasource.persist({ id: "MSG2", content: "message #3" })

        // 3. ASSERT
        await wait(6)
        expect(onDataPersisted.calledOnce).to.be.true;
    })

    it('listener called twice test', async () => {
        
        // 1. ARRANGE
        const datasource = new MockPersistentDataSource()
        const onDataPersisted = sinon.fake()
        await datasource.onDataPersisted(onDataPersisted)

        // 2. ACT
        datasource.persist({ id: "MSG0", content: "message #1" })
        await wait(6)
        datasource.persist({ id: "MSG2", content: "message #3" })

        // 3. ASSERT
        await wait(6)
        expect(onDataPersisted.calledTwice).to.be.true;
    })

    it('run query after event test', async () => {
        
        // 1. ARRANGE
        // 3. ASSERT
        const datasource = new MockPersistentDataSource()
        const onDataPersisted = async () => { 
            const res = await datasource.queryRange("MSG0", "MSG10")
            expect(res.length).to.be.equal(3)
        }
        datasource.onDataPersisted(onDataPersisted)

        // 2. ACT
        datasource.persist({ id: "MSG0", content: "message #1" })
        datasource.persist({ id: "MSG1", content: "message #2" })
        datasource.persist({ id: "MSG2", content: "message #3" })
    })
})
