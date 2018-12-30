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
            .map(key => Number(key.replace("MSG", "")))
            .filter(key => ( key >= queryLowerBoundNumber && key <= queryUpperBoundNumber ) )
        const result = []
        keys.forEach(key => result.push( { id: `MSG${key}`, content: data[`MSG${key}`] } ))
        
        return result
    }

    this.onDataPersisted = async function(onDataPersistedListener) {
        onNewDataPersisted = onDataPersistedListener
    }
}

module.exports = MockPersistentDataSource