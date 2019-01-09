const Plan = require('./Plan')
const PlanExecutor = require('./PlanExecutor')
const { Client: PubSubClient } = require('blockchain-pubsub-client')

const detaultPlan = { startPlan: new Plan( actor => { console.log("no plan defined"); actor.finish() } ) }

const subscriptions = []

function Actor( { actorId, context, state = { }, plans = detaultPlan } ) {
    if(!actorId) throw "Wrong arguments. actorId not defined"
    if(!context || !context.hubIp || !context.hubIp) throw "Wrong arguments. Context not defined or properly formed. 'hubIp' and 'hubPort' are required properties"

    const planExecutor = new PlanExecutor(this)
    const pubSubClient = new PubSubClient(actorId)

    await pubSubClient.connectToHub({ port: context.hubPort, ip: context.hubIp})
    
    this.switchToPlan = function(planName) {
        const plan = plans[planName]

        if(!plan)
            console.error(`[${actorId}] plan "${planName}" not defined.`)
        else {
            subscriptions.forEach(subscription => subscription.unsubscribe())
            subscriptions.length = 0
            
            planExecutor.executeToPlan(plan)
        }
    }

    this.send = function(message) {
        pubSubClient.publish(message)
    }

    this.onReceive = function(name, action) {
        const subscription = pubSubClient.subscribe(name, action)
        subscriptions.push(subscriptions)
        return subscription
    }

    this.finish = function() {
        client.disconnect()
        
        subscriptions.forEach(subscription => subscription.unsubscribe())
        subscriptions.length = 0
    }

    this.switchToPlan("startPlan")
}

module.exports = Actor