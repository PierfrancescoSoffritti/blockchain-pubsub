const expect = require('chai').expect
const MessageIdGenerator = require('../src/MessageIdGenerator')

describe('nextMessageId', () => {
    it('base test', () => {
        
        // 1. ARRANGE
        const currMsg = "MSG0"

        // 2. ACT
        const nextMsg = MessageIdGenerator.nextMessageId(currMsg)

        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG1")
    })

    it('negative number test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG-1"

        // 2. ACT
        const nextMsg = MessageIdGenerator.nextMessageId(currMsg)

        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG0")
    })

    it('wrong message format (MSG string malformed) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MS0"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.nextMessageId(currMsg) ).to.throw();
    })

    it('wrong message format (missing number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.nextMessageId(currMsg) ).to.throw();
    })

    it('wrong message format (extra data after number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG0-extradata"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.nextMessageId(currMsg) ).to.throw();
    })

    it('wrong message format (not a number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG0a"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.nextMessageId(currMsg) ).to.throw();
    })
})

describe('addOffset', () => {
    it('base test', () => {
        
        // 1. ARRANGE
        const currMsg = "MSG0"
  
        // 2. ACT
        const nextMsg = MessageIdGenerator.addOffset(currMsg, 1)
  
        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG1")
    })

    it('big offest test', () => {
        
        // 1. ARRANGE
        const currMsg = "MSG0"
    
        // 2. ACT
        const nextMsg = MessageIdGenerator.addOffset(currMsg, 9999)
    
        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG9999")
    })
  
    it('negative offset positive number test', () => {
      
        // 1. ARRANGE
        const currMsg = "MSG1"
  
        // 2. ACT
        const nextMsg = MessageIdGenerator.addOffset(currMsg, -1)
  
        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG0")
    })

    it('negative offset negative number test', () => {
      
        // 1. ARRANGE
        const currMsg = "MSG-1"
  
        // 2. ACT
        const nextMsg = MessageIdGenerator.addOffset(currMsg, -1)
  
        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG-2")
    })

    it('positive offset negative number test', () => {
      
        // 1. ARRANGE
        const currMsg = "MSG-1"
  
        // 2. ACT
        const nextMsg = MessageIdGenerator.addOffset(currMsg, 1)
  
        // 3. ASSERT
        expect(nextMsg).to.be.equal("MSG0")
    })
  
    it('wrong message format (MSG string malformed) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MS0"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.addOffset(currMsg, 1) ).to.throw();
    })

    it('wrong message format (missing number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.addOffset(currMsg, 1) ).to.throw();
    })

    it('wrong message format (extra data after number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG0-extradata"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.addOffset(currMsg, 1) ).to.throw();
    })

    it('wrong message format (not a number) test', () => {
    
        // 1. ARRANGE
        const currMsg = "MSG0a"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.addOffset(currMsg, 1) ).to.throw();
    })
})

describe('compare', () => {
    it('equal messages test', () => {
        
        // 1. ARRANGE
        const msg1 = "MSG0"
        const msg2 = "MSG0"
  
        // 2. ACT
        const result = MessageIdGenerator.compare(msg1, msg2)
  
        // 3. ASSERT
        expect(result).to.be.equal(0)
    })

    it('first message is smaller test', () => {
        
        // 1. ARRANGE
        const msg1 = "MSG0"
        const msg2 = "MSG1"
  
        // 2. ACT
        const result = MessageIdGenerator.compare(msg1, msg2)
  
        // 3. ASSERT
        expect(result).to.be.equal(-1)
    })

    it('first message is bigger test', () => {
        
        // 1. ARRANGE
        const msg1 = "MSG1"
        const msg2 = "MSG0"
  
        // 2. ACT
        const result = MessageIdGenerator.compare(msg1, msg2)
  
        // 3. ASSERT
        expect(result).to.be.equal(1)
    })
  
    it('wrong message format (MSG string malformed) test', () => {
    
        // 1. ARRANGE
        const msg1 = "MS0"
        const msg2 = "MSG0"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.compare(msg1, msg2) ).to.throw();
    })

    it('wrong message format (missing number) test', () => {
    
        // 1. ARRANGE
        const msg1 = "MSG0"
        const msg2 = "MSG"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.compare(msg1, msg2) ).to.throw();
    })

    it('wrong message format (extra data after number) test', () => {
    
        // 1. ARRANGE
        const msg1 = "MSG0-extradata"
        const msg2 = "MSG0"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.compare(msg1, msg2) ).to.throw();
    })

    it('wrong message format (not a number) test', () => {
    
        // 1. ARRANGE
        const msg1 = "MSG0a"
        const msg2 = "MSG0"

        // 2. ACT
        // 3. ASSERT
        expect( () => MessageIdGenerator.compare(msg1, msg2) ).to.throw();
    })
})