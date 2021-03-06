const expect = require('chai').expect
const sinon = require('sinon')
const TCPClient = require('../src/TCPClient')
const TCPServer = require('../src/TCPServer')
const { wait } = require('../src/utils')

describe('TCPCServer', () => {
    describe('connection', () => {
        it('server accepts connections test', async () => {
            
            // 1. ARRANGE
            const s_onClientConnected = sinon.stub()
            const s_onMessage = sinon.stub()
            const s_onClientEnd = sinon.stub()
            const s_onClientError = sinon.stub()
            const s_onClose = sinon.stub()

            const tcpServer = new TCPServer(
                { onClientConnected: s_onClientConnected, onMessage: s_onMessage, onEnd: s_onClientEnd, onError: s_onClientError, onClose: s_onClose }
            )

            const tcpClient = new TCPClient("clientId", { })

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(10)
            tcpServer.close()
            tcpClient.finish()

            // 3. ASSERT
            expect(s_onClientConnected.calledOnce).to.be.true
        })
    })

    describe('disconnection', () => {
        it('onEnd called once test', async () => {
            
            // 1. ARRANGE
            const s_onClientConnected = sinon.stub()
            const s_onMessage = sinon.stub()
            const s_onClientEnd = sinon.stub()
            const s_onClientError = sinon.stub()
            const s_onClose = sinon.stub()

            const tcpServer = new TCPServer(
                { onClientConnected: s_onClientConnected, onMessage: s_onMessage, onEnd: s_onClientEnd, onError: s_onClientError, onClose: s_onClose }
            )

            const tcpClient = new TCPClient("clientId", { })

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.finish()
            await wait(10)
            tcpServer.close()

            // 3. ASSERT
            expect(s_onClientEnd.calledOnce).to.be.true
        })
    })

    describe('receive message', () => {
        it('one message', async () => {
            
            // 1. ARRANGE
            const s_onClientConnected = sinon.stub()
            const s_onMessage = sinon.stub()
            const s_onClientEnd = sinon.stub()
            const s_onClientError = sinon.stub()
            const s_onClose = sinon.stub()

            const tcpServer = new TCPServer(
                { onClientConnected: s_onClientConnected, onMessage: s_onMessage, onEnd: s_onClientEnd, onError: s_onClientError, onClose: s_onClose }
            )

            const tcpClient = new TCPClient("clientId", { })

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            tcpClient.send("message #1")
            await wait(10)
            tcpServer.close()
            tcpClient.finish()

            // 3. ASSERT
            expect(s_onMessage.calledTwice).to.be.true
            expect(s_onMessage.calledWith("message #1")).to.be.true
        })

        it('multiple messages', async () => {
            
            // 1. ARRANGE
            const s_onClientConnected = sinon.stub()
            const s_onMessage = sinon.stub()
            const s_onClientEnd = sinon.stub()
            const s_onClientError = sinon.stub()
            const s_onClose = sinon.stub()

            const tcpServer = new TCPServer(
                { onClientConnected: s_onClientConnected, onMessage: s_onMessage, onEnd: s_onClientEnd, onError: s_onClientError, onClose: s_onClose }
            )

            const tcpClient = new TCPClient("clientId", { })

            s_onMessage.withArgs("message #1").returns(1)
            s_onMessage.withArgs("message #2").returns(2)
            s_onMessage.withArgs("message #3").returns(3)
            s_onMessage.returns(0)

            // 2. ACT
            tcpServer.start({ port: 8900 })
            tcpClient.connectTo({ port: 8900, ip: "localhost"})
            await wait(20)
            tcpClient.send("message #1")
            tcpClient.send("message #2")
            tcpClient.send("message #3")
            await wait(20)
            tcpServer.close()
            tcpClient.finish()

            // 3. ASSERT
            expect(s_onMessage.callCount).to.be.equal(4)
            expect(s_onMessage.returnValues).to.have.ordered.members([0, 1, 2, 3])
        })
    })
})