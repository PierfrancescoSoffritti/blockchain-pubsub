const expect = require('chai').expect
const sinon = require('sinon')
const { Hub } = require('blockchain-pubsub-hub')
const { MockPersistentDataLayer, wait } = require('blockchain-pubsub-utils')
const { Event, Message } = require('../src/communicationUnits')
const Plan = require('../src/Plan')
const Actor = require('../src/Actor')

describe('Actor', () => {
    describe('examples', () => {
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

        it('no input transition test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const startPlanCallback = sinon.stub()
            const endPlanCallback = sinon.stub()

            const context = { hubIp: "localhost", hubPort: 8900 }

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            
            new Actor( { 
                actorId: "actorNoInputTransition", context,
                plans: { 
                    startPlan: new Plan(actor => {
                        startPlanCallback()
                        actor.switchToPlan("endPlan")
                    }),                    
                    endPlan: new Plan(actor => {
                        endPlanCallback()
                        actor.finish()
                    })
                }
            })

            await wait(100)

            hub.close()

            // 3. ASSERT
            expect(startPlanCallback.calledOnce).to.be.true
            expect(endPlanCallback.calledOnce).to.be.true
        })

        it('basic events test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const event1Callback = sinon.stub()
            const event2Callback = sinon.stub()

            const context = { hubIp: "localhost", hubPort: 8900 }

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            
            new Actor({
                actorId: "emitter", context,
                plans: { 
                    startPlan: new Plan(async actor => {
            
                        await wait(10)
            
                        actor.emit( new Event( { message: { name: "event1", content: "message #1" } } ) )
                        actor.emit( new Event( { message: { name: "event2", content: "message #2" } } ) )
            
                        actor.finish()
                    })
                }
            })
            
            new Actor({
                actorId: "perceptor", context,
                plans: { 
                    startPlan: new Plan(async actor => {
                        await wait(10)
                        
                        actor.onReceive("event1", event1Callback)
                        actor.onReceive("event2", event2Callback)

                        await wait(10)
                        actor.finish()
                    })
                } 
            })

            await wait(100)

            hub.close()

            // 3. ASSERT
            expect(event1Callback.calledOnce).to.be.true
            expect(event2Callback.calledOnce).to.be.true
            expect(event1Callback.calledWith("message #1")).to.be.true
            expect(event2Callback.calledWith("message #2")).to.be.true
        })

        it('basic messages test', async () => {            
            // 1. ARRANGE
            const datalayer = new MockPersistentDataLayer()
            const hub = new Hub("hub0", datalayer)
            
            const message1Callback = sinon.stub()
            const message2Callback = sinon.stub()
            const message3Callback = sinon.stub()

            const context = { hubIp: "localhost", hubPort: 8900 }

            // 2. ACT
            await hub.start({ publicAddress: 'localhost', tcpPort: 8900, udpPort: 9000 })
            
            new Actor({ 
                actorId: "producer", context,
                plans: { 
                    startPlan: new Plan(async actor => {
            
                        actor.emit(new Message({ recipient: "consumer", message: { name: "testMessage1", content: 1 } }))
            
                        await wait(10)
            
                        actor.emit(new Message({ recipient: "consumer", message: { name: "testMessage2", content: 2 } }))
                        actor.emit(new Message({ recipient: "consumer", message: { name: "testMessage3", content: 3 } }))

                        actor.finish()
                    }) 
                }
            })
    
            new Actor( { 
                actorId: "consumer", context,
                plans: { 
                    startPlan: new Plan(async actor => {

                        await wait(10)
                     
                        actor.onReceive("testMessage1", message1Callback)
                        actor.onReceive("testMessage2", message2Callback)
                        actor.onReceive("testMessage3", message3Callback)

                        await wait(10)
                        actor.finish()
                    })
                } 
            })

            await wait(100)

            hub.close()

            // 3. ASSERT
            expect(message1Callback.notCalled).to.be.true
            expect(message2Callback.calledOnce).to.be.true
            expect(message3Callback.calledOnce).to.be.true

            expect(message2Callback.calledWith(2)).to.be.true
            expect(message3Callback.calledWith(3)).to.be.true
        })
    })
})