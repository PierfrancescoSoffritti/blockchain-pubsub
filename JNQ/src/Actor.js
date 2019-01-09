const Plan = require('./Plan')
const PlanExecutor = require('./PlanExecutor')
const { Client: PubSubClient } = require('blockchain-pubsub-client')

const detaultPlan = { startPlan: new Plan( actor => { console.log("no plan defined"); actor.finish() } ) }

const subscriptions = []

function Actor({ actorId, context, state = { }, plans = detaultPlan }) {
    if(!actorId) throw "Wrong arguments. actorId not defined"
    if(!context || !context.hubIp || !context.hubIp) throw "Wrong arguments. Context not defined or properly formed. 'hubIp' and 'hubPort' are required properties"
    if(!plans.startPlan) throw `No startPlan defined for actor ${actorId}`

    const self = this
    const planExecutor = new PlanExecutor(this)
    const pubsubClient = new PubSubClient(actorId)
    
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

    this.emit = function(message) {
        pubsubClient.publish(message)
    }

    this.onReceive = function(name, action) {
        const subscription = pubsubClient.subscribe(name, action)
        subscriptions.push(subscriptions)
        return subscription
    }

    this.finish = function() {
        pubsubClient.disconnect()
        
        subscriptions.forEach(subscription => subscription.unsubscribe())
        subscriptions.length = 0
    }

    async function start({ ip, port }) {
        await pubsubClient.connectToHub({ ip, port })
        self.switchToPlan("startPlan")
    }

    start({ ip: context.hubIp, port: context.hubPort })
}

module.exports = Actor