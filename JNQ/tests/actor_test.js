const expect = require('chai').expect
const sinon = require('sinon')
const { Hub } = require('blockchain-pubsub-hub')
const { MockPersistentDataLayer, wait } = require('blockchain-pubsub-utils')
const Plan = require('../src/Plan')
const Actor = require('../src/Actor')

describe('Actor', () => {
    describe('Message', () => {
        it('base test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const callback = sinon.stub()

            const context = { hubIp: "localhost", hubPort: 8900 }

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            
            const actor = new Actor({ 
                actorId: "actorHelloWorld", context,
                plans: { 
                    startPlan: new Plan(actor => {
                        callback()
                        actor.finish()
                    }) 
                } 
            })

            await wait(100)

            hub.close()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
        })
    })
})