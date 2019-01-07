const expect = require('chai').expect
const MessageIdGenerator = require('../src/MessageIdGenerator')

describe("MessageIdGenerator", () => {    
    
    describe('constructor', () => {
        it('throws when prefix ends with number test', () => {
            // 1. ARRANGE
            // 2. ACT
            // 3. ASSERT
            expect(() => new MessageIdGenerator("MSG1")).to.throw()
        })
    })

    describe('nextMessageId', () => {
        it('base test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0"

            // 2. ACT
            const nextMsg = messageIdGenerator.nextMessageId(currMsg)

            // 3. ASSERT
            expect(nextMsg).to.be.equal("MSG1")
        })

        it('different prefix test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("TEST")
            const currMsg = "TEST0"

            // 2. ACT
            const nextMsg = messageIdGenerator.nextMessageId(currMsg)

            // 3. ASSERT
            expect(nextMsg).to.be.equal("TEST1")
        })

        it('add digit test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG9"

            // 2. ACT
            const nextMsg = messageIdGenerator.nextMessageId(currMsg)

            // 3. ASSERT
            expect(nextMsg).to.be.equal("MSG90")
        })

        it('negative number test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG-1"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.nextMessageId(currMsg) ).to.throw()
        })

        it('wrong message format (MSG string malformed) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MS0"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.nextMessageId(currMsg) ).to.throw();
        })

        it('wrong message format (missing number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.nextMessageId(currMsg) ).to.throw();
        })

        it('wrong message format (extra data after number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0-extradata"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.nextMessageId(currMsg) ).to.throw();
        })

        it('wrong message format (not a number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0a"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.nextMessageId(currMsg) ).to.throw();
        })
    })

    describe('addOffset', () => {
        it('base test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0"
    
            // 2. ACT
            const nextMsg = messageIdGenerator.addOffset(currMsg, 1)
    
            // 3. ASSERT
            expect(nextMsg).to.be.equal("MSG1")
        })

        it('add digit test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG9"
    
            // 2. ACT
            const nextMsg = messageIdGenerator.addOffset(currMsg, 1)
    
            // 3. ASSERT
            expect(nextMsg).to.be.equal("MSG90")
        })

        it('big offest test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0"
        
            // 2. ACT
            const nextMsg = messageIdGenerator.addOffset(currMsg, 100)
        
            // 3. ASSERT
            expect(nextMsg).to.be.equal("MSG99999999990")
        })
    
        it('negative offset test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG1"
    
            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.addOffset(currMsg, -1) ).to.throw()
        })
    
        it('wrong message format (MSG string malformed) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MS0"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.addOffset(currMsg, 1) ).to.throw();
        })

        it('wrong message format (missing number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.addOffset(currMsg, 1) ).to.throw();
        })

        it('wrong message format (extra data after number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0-extradata"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.addOffset(currMsg, 1) ).to.throw();
        })

        it('wrong message format (not a number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const currMsg = "MSG0a"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.addOffset(currMsg, 1) ).to.throw();
        })
    })

    describe('compare', () => {
        it('equal messages test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG0"
            const msg2 = "MSG0"
    
            // 2. ACT
            const result = messageIdGenerator.compare(msg1, msg2)
    
            // 3. ASSERT
            expect(result).to.be.equal(0)
        })

        it('first message is smaller test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG0"
            const msg2 = "MSG1"
    
            // 2. ACT
            const result = messageIdGenerator.compare(msg1, msg2)
    
            // 3. ASSERT
            expect(result).to.be.equal(-1)
        })

        it('first message is bigger test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG1"
            const msg2 = "MSG0"
    
            // 2. ACT
            const result = messageIdGenerator.compare(msg1, msg2)
    
            // 3. ASSERT
            expect(result).to.be.equal(1)
        })

        it('first message is lexographically bigger test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG90"
            const msg2 = "MSG100"
    
            // 2. ACT
            const result = messageIdGenerator.compare(msg1, msg2)
    
            // 3. ASSERT
            expect(result).to.be.equal(1)
        })

        it('second message is lexographically bigger test', () => {
            
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG100"
            const msg2 = "MSG90"
    
            // 2. ACT
            const result = messageIdGenerator.compare(msg1, msg2)
    
            // 3. ASSERT
            expect(result).to.be.equal(-1)
        })
    
        it('wrong message format (MSG string malformed) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MS0"
            const msg2 = "MSG0"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.compare(msg1, msg2) ).to.throw();
        })

        it('wrong message format (missing number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG0"
            const msg2 = "MSG"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.compare(msg1, msg2) ).to.throw();
        })

        it('wrong message format (extra data after number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG0-extradata"
            const msg2 = "MSG0"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.compare(msg1, msg2) ).to.throw();
        })

        it('wrong message format (not a number) test', () => {
        
            // 1. ARRANGE
            const messageIdGenerator = new MessageIdGenerator("MSG")
            const msg1 = "MSG0a"
            const msg2 = "MSG0"

            // 2. ACT
            // 3. ASSERT
            expect( () => messageIdGenerator.compare(msg1, msg2) ).to.throw();
        })
    })
})