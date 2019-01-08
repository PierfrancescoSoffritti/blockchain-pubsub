const { EventBus, TCPClient } = require('blockchain-pubsub-utils')

function Client(clientId) {
    if(!clientId)
        throw `Client id not provided`

    const tcpClient = new TCPClient(
        clientId,
        { onMessageReceived: message => EventBus.post(message.payload.name, message.payload.content) }
    )

    this.connectToHub = async function({ port, ip }) {
        await tcpClient.connectTo({ port, ip })
    }

    this.disconnect = function() {
        tcpClient.finish()
    }

    this.publish = function({ recipientId, isPersistent, message }) {
        if(!message || !message.name || !message.content)
            throw `Message is not properly formatted. 'name' and 'content' fields are expected.`

        tcpClient.send({ recipientId, isPersistent, payload: message })
    }

    this.subscribe = function(topic, action) {
        return EventBus.subscribe(topic, action)
    }
}

module.exports = Client