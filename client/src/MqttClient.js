const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

client.on('connect', () => {
    client.subscribe('garage/connected')
})

client.on('message', (topic, message) => {
    if(topic === 'garage/connected') {
        connected = (message.toString() === 'true');
    }
})