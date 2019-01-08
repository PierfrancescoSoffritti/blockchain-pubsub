/**
 * object format: 
 * { eventType: { id: callback } }
 */
const subscriptions = { }
const getNextUniqueId = getIdGenerator()

function subscribe(eventType, callback) {
    const id = getNextUniqueId()

    if(!subscriptions[eventType])
        subscriptions[eventType] = { }

    subscriptions[eventType][id] = callback

    return { 
        unsubscribe: () => { 
            Object.keys(subscriptions[eventType]).length == 1 ?
            delete subscriptions[eventType] : delete subscriptions[eventType][id]
        } 
    }
}

function post(eventType, arg) {
    if(!subscriptions[eventType])
        return

    Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg))
}

function getIdGenerator() {
    let lastId = 0
    
    return function getNextUniqueId() {
        lastId += 1
        return lastId
    }
}

module.exports = { subscribe, post }