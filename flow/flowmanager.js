DEBUG = false;

export default class FlowManager {
  methodQueue = [];
  isReacting = false;

  queue(method: (onReactionOver: method) => void, ...args) {
    if (DEBUG) console.log("Queuing", method);
    this.methodQueue.push({ method, args });
    this.handleNextAction();
  }

  handleNextAction() {
    if (this.isReacting) return;
    if (this.methodQueue.length == 0) return;

    this.isReacting = true;

    const action = this.methodQueue[0];
    this.methodQueue = this.methodQueue.slice(1);

    if (DEBUG) console.log("Executing", action.method);

    action.method(this.onReactionOver.bind(this), ...action.args);
  }

  onReactionOver() {
    this.isReacting = false;
    this.handleNextAction();
  }
}
