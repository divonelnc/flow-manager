DEBUG = false;

export default class FlowManager {
  methodQueue = [];
  isReacting = false;

  queue(
    method: (onReactionOver: method, target: ?object, newState: ?object) => void,
    target: ?object,
    newState: ?object
  ) {
    if (DEBUG) console.log("Queuing", method);
    this.methodQueue.push({ method, target, newState });
    this.handleNextAction();
  }

  handleNextAction() {
    if (this.isReacting) return;
    if (this.methodQueue.length == 0) return;

    this.isReacting = true;

    const action = this.methodQueue[0];
    this.methodQueue = this.methodQueue.slice(1);

    if (DEBUG) console.log("Executing", action.method);

    action.method(this.onReactionOver.bind(this), action.target, action.newState);
  }

  onReactionOver() {
    this.isReacting = false;
    this.handleNextAction();
  }
}
