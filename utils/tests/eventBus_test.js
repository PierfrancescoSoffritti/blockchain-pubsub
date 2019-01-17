const expect = require('chai').expect
const sinon = require('sinon')
const EventBus = require('../src/EventBus')

describe('EventBus', () => {
    describe('subscribe', () => {
        it('basic test', () => {
            
            // 1. ARRANGE
            const eventName = "event1"
            const callback = sinon.stub()
            const subscription = EventBus.subscribe(eventName, callback)
            
            // 2. ACT
            EventBus.post(eventName, "message #1")
            subscription.unsubscribe()

            // 3. ASSERT
            expect(callback.calledOnce).to.be.true
            expect(callback.calledWith("message #1")).to.be.true
        })

        it('different events', () => {
            
            // 1. ARRANGE
            const event1 = "event1"
            const event2 = "event2"
            const callback1 = sinon.stub()
            const callback2 = sinon.stub()
            const subscription1 = EventBus.subscribe(event1, callback1)
            const subscription2 = EventBus.subscribe(event2, callback2)
            
            // 2. ACT
            EventBus.post(event1, "message #1")
            EventBus.post(event2, "message #2")

            subscription1.unsubscribe()
            subscription2.unsubscribe()

            // 3. ASSERT
            expect(callback1.calledOnce).to.be.true
            expect(callback1.calledWith("message #1")).to.be.true
            expect(callback2.calledOnce).to.be.true
            expect(callback2.calledWith("message #2")).to.be.true
        })

        it('multiple subscribers for same event', () => {
            
            // 1. ARRANGE
            const eventName = "event1"
            const callback1 = sinon.stub()
            const callback2 = sinon.stub()
            const subscription1 = EventBus.subscribe(eventName, callback1)
            const subscription2 = EventBus.subscribe(eventName, callback2)
            
            // 2. ACT
            EventBus.post(eventName, "message #1")

            subscription1.unsubscribe()
            subscription2.unsubscribe()

            // 3. ASSERT
            expect(callback1.calledOnce).to.be.true
            expect(callback1.calledWith("message #1")).to.be.true

            expect(callback2.calledOnce).to.be.true
            expect(callback2.calledWith("message #1")).to.be.true
        })

        it('unsubscribe one', () => {
            
            // 1. ARRANGE
            const event1 = "event1"

            const callback1 = sinon.stub()
            callback1.withArgs("message #1").returns(1)
            callback1.withArgs("message #2").returns(2)
            callback1.returns(-1)

            const callback2 = sinon.stub()
            callback2.withArgs("message #1").returns(1)
            callback2.withArgs("message #2").returns(2)
            callback2.returns(-1)

            const callback3 = sinon.stub()
            callback3.withArgs("message #1").returns(1)
            callback3.withArgs("message #2").returns(2)
            callback3.returns(-1)

            const subscription1 = EventBus.subscribe(event1, callback1)
            const subscription2 = EventBus.subscribe(event1, callback2)
            const subscription3 = EventBus.subscribe(event1, callback3)
            
            // 2. ACT
            EventBus.post(event1, "message #1")
            subscription2.unsubscribe()
            EventBus.post(event1, "message #2")

            subscription1.unsubscribe()
            subscription2.unsubscribe()
            subscription3.unsubscribe()

            // 3. ASSERT
            expect(callback1.calledTwice).to.be.true
            expect(callback1.returnValues).to.have.ordered.members([1, 2])
            expect(callback2.calledOnce).to.be.true
            expect(callback2.returnValues).to.have.ordered.members([1])
            expect(callback3.calledTwice).to.be.true
            expect(callback3.returnValues).to.have.ordered.members([1, 2])
        })

        /**
         * There’s nasty bug in unsubscribe function.
         * When there are 2 subscriptions S1 and S2 for event type “A”
         * calling unsubscribe twice for the same subscription (S1 or S2) will unsubscribe both of them.
         * 
         * Implementation shouldn’t rely on “Object.keys(subscriptions[eventType]).length == 1”
         * it should always check for subscriber id in event type subscriptions.
         */
        it('unsubscribe doesnt remove other subscribers', () => {
            
            // 1. ARRANGE
            const event1 = "event1"

            const callback1 = sinon.stub()
            callback1.withArgs("message #1").returns(1)
            callback1.withArgs("message #2").returns(2)
            callback1.returns(-1)

            const callback2 = sinon.stub()
            callback2.withArgs("message #1").returns(1)
            callback2.withArgs("message #2").returns(2)
            callback2.returns(-1)

            const subscription1 = EventBus.subscribe(event1, callback1)
            const subscription2 = EventBus.subscribe(event1, callback2)
            
            // 2. ACT
            EventBus.post(event1, "message #1")
            subscription1.unsubscribe()
            subscription1.unsubscribe()
            EventBus.post(event1, "message #2")

            subscription1.unsubscribe()
            subscription2.unsubscribe()

            // 3. ASSERT
            expect(callback1.calledOnce).to.be.true
            expect(callback1.returnValues).to.have.ordered.members([1])
            expect(callback2.calledTwice).to.be.true
            expect(callback2.returnValues).to.have.ordered.members([1, 2])
        })

        it('unsubscribe all', () => {
            
            // 1. ARRANGE
            const event1 = "event1"

            const callback1 = sinon.stub()
            callback1.withArgs("message #1").returns(1)
            callback1.withArgs("message #2").returns(2)
            callback1.returns(-1)

            const callback2 = sinon.stub()
            callback2.withArgs("message #1").returns(1)
            callback2.withArgs("message #2").returns(2)
            callback2.returns(-1)

            const callback3 = sinon.stub()
            callback3.withArgs("message #1").returns(1)
            callback3.withArgs("message #2").returns(2)
            callback3.returns(-1)

            const subscription1 = EventBus.subscribe(event1, callback1)
            const subscription2 = EventBus.subscribe(event1, callback2)
            const subscription3 = EventBus.subscribe(event1, callback3)
            
            // 2. ACT
            EventBus.post(event1, "message #1")
            subscription1.unsubscribe()
            subscription2.unsubscribe()
            subscription3.unsubscribe()
            EventBus.post(event1, "message #2")

            // 3. ASSERT
            expect(callback1.calledOnce).to.be.true
            expect(callback1.returnValues).to.have.ordered.members([1])
            expect(callback2.calledOnce).to.be.true
            expect(callback2.returnValues).to.have.ordered.members([1])
            expect(callback3.calledOnce).to.be.true
            expect(callback3.returnValues).to.have.ordered.members([1])
        })

        it('unsubscribe resubscribe', () => {
            
            // 1. ARRANGE
            const event1 = "event1"

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

            const callback3 = sinon.stub()
            callback3.withArgs("message #1").returns(1)
            callback3.withArgs("message #2").returns(2)
            callback3.withArgs("message #3").returns(3)
            callback3.returns(-1)

            const subscription1 = EventBus.subscribe(event1, callback1)
            const subscription2 = EventBus.subscribe(event1, callback2)
            const subscription3 = EventBus.subscribe(event1, callback3)
            
            // 2. ACT
            EventBus.post(event1, "message #1")
            subscription1.unsubscribe()
            subscription2.unsubscribe()
            subscription3.unsubscribe()
            EventBus.post(event1, "message #2")
            EventBus.subscribe(event1, callback1)
            EventBus.post(event1, "message #3")

            // 3. ASSERT
            expect(callback1.calledTwice).to.be.true
            expect(callback1.returnValues).to.have.ordered.members([1, 3])
            expect(callback2.calledOnce).to.be.true
            expect(callback2.returnValues).to.have.ordered.members([1])
            expect(callback3.calledOnce).to.be.true
            expect(callback3.returnValues).to.have.ordered.members([1])
        })
    })
})