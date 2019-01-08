const { EventBus, TCPClient } = require('blockchain-pubsub-utils')

function Client(clientId) {
    const tcpClient = new TCPClient(
        clientId,
        { onMessageReceived: message => EventBus.post(message.payload.name, message.payload.content) }
    )

    this.connectToHub = async function({ port, ip }) {
        await tcpClient.connectTo({ port, ip })
    }

    this.publish = function({ recipientId, isPersistent, message }) {
        tcpClient.send({ recipientId, isPersistent, payload: message })
    }

    this.subscribe = function(topic, action) {
        return EventBus.subscribe(topic, action)
    }
}

module.exports = Client