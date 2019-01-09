const expect = require('chai').expect
const Plan = require('../src/Plan')

describe('Plan', () => {
    describe('constructor', () => {
        it('base test', async () => {            
            // 1. ARRANGE
            const action = () => { }
            const finalAction = () => { }

            // 2. ACT
            const plan = new Plan(action, finalAction)
            
            // 3. ASSERT
            expect(plan.action).to.be.equal(action)
            expect(plan.finalAction).to.be.equal(finalAction)            
        })

        it('no final action test', async () => {            
            // 1. ARRANGE
            const action = () => { }

            // 2. ACT
            const plan = new Plan(action)
            
            // 3. ASSERT
            expect(plan.action).to.be.equal(action)
            expect(JSON.stringify(plan.finalAction)).to.be.equal(JSON.stringify( () => { } ))
        })

        it('no action defined test', async () => {            
            // 1. ARRANGE
            const action = () => { }
            const finalAction = () => { }

            // 2. ACT
            // 3. ASSERT
            expect( () => new Plan() ).to.throw()
        })
    })
})