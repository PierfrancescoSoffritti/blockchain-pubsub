const detaultAction = actor => console.log("no action for this plan")
const defaultFinalAction = actor => { }

function Plan( action = detaultAction, finalAction = defaultFinalAction ) {
    this.action = action
    this.finalAction = finalAction
}

module.exports = Plan