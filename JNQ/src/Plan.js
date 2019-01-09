const defaultFinalAction = actor => { }

function Plan(action, finalAction = defaultFinalAction) {
    if(!action) throw `No action defined for this plan`
    
    this.action = action
    this.finalAction = finalAction
}

module.exports = Plan