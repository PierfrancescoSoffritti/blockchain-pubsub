function MockPersistentDataLayer() {
    const data = { }
    this.data = data

    let timeoutId = -1

    // one for each pubsub subscribed on this data layer
    let onNewDataPersistedListeners = []

    this.persist = async function(message) {
        data[message.id] = message.content

        if(timeoutId === -1)
            timeoutId = setTimeout(() => { onNewDataPersistedListeners.forEach(listener => listener()); timeoutId = -1 }, 5)
    }

    /**
    * returns: [ { id: "..", content: { .. } } ]
    */
    this.queryRange = async function(queryLowerBound, queryUpperBound) {

        const prefix = queryLowerBound.replace(/\d+$/, "")
     
        const queryLowerBoundNumber = Number(queryLowerBound.replace(prefix, ""))
        const queryUpperBoundNumber = Number(queryUpperBound.replace(prefix, ""))

        const keys = Object.keys(data)
            .filter(key => key.startsWith(prefix))
            .map(key => { return { key, number: Number( key.replace(prefix, "").split("-")[0] ) } } )
            .filter(key => ( key.number >= queryLowerBoundNumber && key.number <= queryUpperBoundNumber ) )
            .map( key => key.key)
        
        const result = []
        keys.forEach(key => result.push( { id: key, content: data[key] } ))
        
        return result
    }

    this.onDataPersisted = async function(onDataPersistedListener) {
        onNewDataPersistedListeners.push(onDataPersistedListener)
        return { disconnect: () => {} }
    }

    this.getDataArray = function(){
        return Object.keys(data).map(key => { return { id: key, content: data[key] } } );
    }
}

module.exports = MockPersistentDataLayer