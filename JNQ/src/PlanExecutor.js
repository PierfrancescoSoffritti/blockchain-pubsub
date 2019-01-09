function PlanExecutor(actor) {
    this.executeToPlan = function(plan) {        
        plan.action(actor)
        plan.finalAction(actor)
    }
}

module.exports = PlanExecutor