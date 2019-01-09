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
            await tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(onConnecting.calledOnce).to.be.true
            expect(onConnected.calledOnce).to.be.true
        })

        it('connect to wrong address test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const callback = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: onConnecting, onConnected: onConnected, onConnectionClosed: onConnectionClosed, onError: onError, onMessageReceived: onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            await wait(20)
            await tcpClient.connectTo({ port: 8901, ip: "localhost"}).catch(callback)
            await wait(20)
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(onConnecting.notCalled).to.be.true
            expect(onConnected.notCalled).to.be.true
            expect(onError.calledOnce).to.be.true
            expect(callback.calledOnce).to.be.true
        })
    })

    describe('diconnection', () => {
        it('base test', async () => {
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
            await tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.finish()
            tcpServer.close()
            await wait(10)

            // 3. ASSERT
            expect(onConnectionClosed.calledOnce).to.be.true
        })

        it('disconnect before connection test', async () => {
            // 1. ARRANGE            
            const tcpClient = new TCPClient("clientId", { })

            // 2. ACT
            // 3. ASSERT            
            expect( () => tcpClient.finish() ).to.throw()
        })
    })

    describe('error', () => {
        it('server disconnects test', async () => {
            // 1. ARRANGE            
            const tcpServer = new TCPServer({ })

            const onConnecting = sinon.stub()
            const onConnected = sinon.stub()
            const onConnectionClosed = sinon.stub()
            const onError = sinon.stub()
            const onMessageReceived = sinon.stub()

            const callback = sinon.stub()

            const tcpClient = new TCPClient(
                "clientId",
                { onConnecting: onConnecting, onConnected: onConnected, onConnectionClosed: onConnectionClosed, onError: onError, onMessageReceived: onMessageReceived }
            )

            // 2. ACT
            tcpServer.start({ port: 8900 })
            await tcpClient.connectTo({ port: 8900, ip: "localhost"}).then(callback)
            tcpServer.close()
            tcpClient.finish()
            await wait(10)

            // 3. ASSERT
            expect(onConnectionClosed.calledOnce).to.be.true
            expect(callback.calledOnce).to.be.true
        })
    })

    describe('communication', () => {
        it('receive message from server test', async () => {
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
            await tcpClient.connectTo({ port: 8900, ip: "localhost"})     
            await wait(10)
            tcpClient.finish()
            tcpServer.close()

            // 3. ASSERT
            expect(onMessageReceived.calledOnce).to.be.true
            expect(onMessageReceived.calledWith("hardcoded message from server")).to.be.true
        })

        it('send before connection test', async () => {
            // 1. ARRANGE            
            const tcpClient = new TCPClient("clientId", { })

            // 2. ACT
            // 3. ASSERT            
            expect( () => tcpClient.send("message #1") ).to.throw()
        })
    })
})