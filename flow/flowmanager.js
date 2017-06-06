DEBUG = false;

export default class FlowManager {
  methodQueue = [];
  isProcessingItem = false;

  queue(method: (onTaskEnded: method) => void, ...args) {
    if (DEBUG) console.log("Queuing", method);
    this.methodQueue.push({ method, args });
    this.handleNextAction();
  }

  clear()
  {
    this.isProcessingItem = false;
    this.methodQueue = [];
  }

  handleNextAction() {
    if (this.isProcessingItem) return;
    if (this.methodQueue.length == 0) return;

    this.isProcessingItem = true;

    const item = this.methodQueue[0];
    this.methodQueue = this.methodQueue.slice(1);

    if (DEBUG) console.log("Executing", item.method);

    item.method(this.onTaskEnded.bind(this), ...item.args);
  }

  onTaskEnded() {
    this.isProcessingItem = false;
    this.handleNextAction();
  }
}
