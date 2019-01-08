function Client() {

    const subscriptions = { }
    
    tcpclient.onNewMessage(message => Object.keys(subscriptions).filter(key => key === message.topic).forEach )

    this.publish = function() {
    }

    this.subscribe = function(topic, action) {
        subscriptions[topic] = action
    }
}