const expect = require('chai').expect
const sinon = require('sinon')
const { Message, Event } = require('../src/communicationUnits')

describe('communicationUnits', () => {
    describe('Message', () => {
        it('base test', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name", content: "message #1" }

            // 2. ACT
            const message = new Message({ recipient: "recipient", isPersistent: true, message: messageContent })
            
            // 3. ASSERT
            expect(message.recipientId).to.be.equal("recipient")
            expect(message.isPersistent).to.be.true
            expect(message.message).to.be.equal(messageContent)
        })

        it('isPersistent default value test', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name", content: "message #1" }

            // 2. ACT
            const message = new Message({ recipient: "recipient", message: messageContent })
            
            // 3. ASSERT
            expect(message.isPersistent).to.be.true
        })

        it('no recipient test', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name", content: "message #1" }
            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ message: messageContent }) ).to.throw()
        })

        it('no message test', async () => {            
            // 1. ARRANGE            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ recipient: "recipient" }) ).to.throw()
        })

        it('wrong message format test1', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name", payload: "message #1" }
            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ recipient: "recipient", message: messageContent }) ).to.throw()
        })

        it('wrong message format test1', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name" }
            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ recipient: "recipient", message: messageContent }) ).to.throw()
        })

        it('wrong message format test1', async () => {            
            // 1. ARRANGE
            const messageContent = { namee: "name", message: "message #1" }
            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ recipient: "recipient", message: messageContent }) ).to.throw()
        })

        it('wrong message format test1', async () => {            
            // 1. ARRANGE
            const messageContent = { message: "message #1" }
            
            // 2. ACT
            // 3. ASSERT
            expect( () => new Message({ recipient: "recipient", message: messageContent }) ).to.throw()
        })
    })

    describe('Event', () => {
        it('base test', async () => {            
            // 1. ARRANGE
            const messageContent = { name: "name", content: "message #1" }

            // 2. ACT
            const event = new Event({ isPersistent: true, message: messageContent })
            
            // 3. ASSERT
            expect(event.recipientId).to.be.equal("*")
            expect(event.isPersistent).to.be.true
            expect(event.message).to.be.equal(messageContent)
        })
    })
})