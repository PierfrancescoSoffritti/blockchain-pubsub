const expect = require('chai').expect
const sinon = require('sinon')
const TCPClient = require('../src/TCPClient')
const TCPServer = require('../src/TCPServer')
const { wait } = require('../src/utils')

describe('TCPClient', () => {
    describe('connection', () => {
        it('base test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const c_onConnecting = sinon.stub()
            const c_onConnected = sinon.stub()
            const c_onConnectionClosed = sinon.stub()
            const c_onErrorClient = sinon.stub()
            const c_onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: c_onConnecting, onConnected: c_onConnected, onConnectionClosed: c_onConnectionClosed, onError: c_onErrorClient, onMessageReceived: c_onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(4)
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(c_onConnecting.calledOnce).to.be.true
            expect(c_onConnected.calledOnce).to.be.true
        })
    })

    describe('diconnection', () => {
        it('base test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const c_onConnecting = sinon.stub()
            const c_onConnected = sinon.stub()
            const c_onConnectionClosed = sinon.stub()
            const c_onErrorClient = sinon.stub()
            const c_onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: c_onConnecting, onConnected: c_onConnected, onConnectionClosed: c_onConnectionClosed, onError: c_onErrorClient, onMessageReceived: c_onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.finish()
            tcpServer.close()
            await wait(10)

            // 3. ASSERT
            expect(c_onConnectionClosed.calledOnce).to.be.true
        })
    })

    describe('error', () => {
        it('server disconnects test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const c_onConnecting = sinon.stub()
            const c_onConnected = sinon.stub()
            const c_onConnectionClosed = sinon.stub()
            const c_onErrorClient = sinon.stub()
            const c_onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: c_onConnecting, onConnected: c_onConnected, onConnectionClosed: c_onConnectionClosed, onError: c_onErrorClient, onMessageReceived: c_onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})            
            tcpServer.close()
            tcpClient.finish()
            await wait(10)

            // 3. ASSERT
            expect(c_onConnectionClosed.calledOnce).to.be.true
        })
    })

    describe('communication', () => {
        it('receive message from server test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const c_onConnecting = sinon.stub()
            const c_onConnected = sinon.stub()
            const c_onConnectionClosed = sinon.stub()
            const c_onErrorClient = sinon.stub()
            const c_onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: c_onConnecting, onConnected: c_onConnected, onConnectionClosed: c_onConnectionClosed, onError: c_onErrorClient, onMessageReceived: c_onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})     
            await wait(10)
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(c_onMessageReceived.calledOnce).to.be.true
            expect(c_onMessageReceived.calledWith("hardcoded message from server")).to.be.true
        })
    })
})