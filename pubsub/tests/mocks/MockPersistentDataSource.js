function MockPersistentDataSource() {
    const data = { }
    this.data = data

    let timeoutId = -1

    let onNewDataPersisted = () => {}

    this.persist = async function(message) {
        data[message.id] = message.content

        if(timeoutId === -1)
            timeoutId = setTimeout(() => { onNewDataPersisted(); timeoutId = -1 }, 5)
    }

    this.queryRange = async function(queryLowerBound, queryUpperBound) {
     
        const queryLowerBoundNumber = Number(queryLowerBound.replace("MSG", ""))
        const queryUpperBoundNumber = Number(queryUpperBound.replace("MSG", ""))

        const keys = Object.keys(data)
            .map(key => { return { key, number: Number( key.replace("MSG", "").split("-")[0] ) } } )
            .filter(key => ( key.number >= queryLowerBoundNumber && key.number <= queryUpperBoundNumber ) )
            .map( key => key.key)
        
        const result = []
        keys.forEach(key => result.push( { id: key, content: data[key] } ))
        
        return result
    }

    this.onDataPersisted = async function(onDataPersistedListener) {
        onNewDataPersisted = onDataPersistedListener
    }

    this.getDataArray = function(){
        return Object.keys(data).map(key => { return { id: key, content: data[key] } } );
    }
}

module.exports = MockPersistentDataSource