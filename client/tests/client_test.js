const expect = require('chai').expect
const sinon = require('sinon')
const Client = require('../src/Client')
const { MockPersistentDataLayer, wait } = require('blockchain-pubsub-utils')
const Hub = require('blockchain-pubsub-hub')

describe('Client', () => {
    describe('connection', () => {
        it('succesfull connection test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })

        it('connection failure test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })
    })

    describe('publish', () => {
        it('throws if payload has wrong format test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })
    })

    describe('publish-subscribe', () => {
        it('same client test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })

        it('separate clients (persistent message) test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })

        it('separate clients (non persistent message) test', async () => {            
            // 1. ARRANGE

            // 2. ACT

            // 3. ASSERT
        })
    })
})