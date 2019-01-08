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
            await wait(20)
            await tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(c_onConnecting.calledOnce).to.be.true
            expect(c_onConnected.calledOnce).to.be.true
        })

        it('connect to wrong address test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: onConnecting, onConnected: onConnected, onConnectionClosed: onConnectionClosed, onError: onError, onMessageReceived: onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            await wait(20)
            tcpClient.connectTo({ port: 8901, ip: "localhost"})
            await wait(20)
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(onConnecting.notCalled).to.be.true
            expect(onConnected.notCalled).to.be.true
            expect(onError.calledOnce).to.be.true
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