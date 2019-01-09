const expect = require('chai').expect
const sinon = require('sinon')
const Plan = require('../src/Plan')
const PlanExecutor = require('../src/PlanExecutor')

describe('PlanExecutor', () => {
    describe('constructor', () => {
        it('base test', async () => {            
            // 1. ARRANGE
            const actor = { }

            const action = sinon.stub()
            const finalAction = sinon.stub()

            const plan = new Plan(action, finalAction)
            const planExecutor = new PlanExecutor(actor)

            // 2. ACT
            planExecutor.executeToPlan(plan)
            
            // 3. ASSERT
            expect(action.calledOnce).to.be.true
            expect(finalAction.calledOnce).to.be.true
            
            expect(action.calledWith(actor)).to.be.true
            expect(finalAction.calledWith(actor)).to.be.true
        })
    })
})