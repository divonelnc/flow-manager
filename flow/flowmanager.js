DEBUG = false;

export default class FlowManager {
  methodQueue = [];
  isProcessingItem = false;
  feed = [];
  queueStartedListener = null;
  queueClearedListener = null;

  addQueueStateListeners(onQueueCleared, onQueueStarted) {
    this.queueClearedListener = onQueueCleared;
    this.queueStartedListener = onQueueStarted;
  }

  queue(method: (onTaskEnded: method) => void, ...args) {
    if (DEBUG) console.log("Queuing", method);

    if (this.methodQueue.length == 0 && this.queueStartedListener) this.queueStartedListener();

    this.methodQueue.push({ method, args });
    this.handleNextItem();
  }

  // This item will feed the next item in the queue with parameters when calling it's onTaskEnded callback
  queueAndFeed(method: (onTaskEnded: method) => void, ...args) {
    if (DEBUG) console.log("Queuing with feeding", method);

    if (this.methodQueue.length == 0 && this.queueStartedListener) this.queueStartedListener();

    this.methodQueue.push({ method, args, feeding: true });
    this.handleNextItem();
  }

  clear(triggerListener) {
    this.isProcessingItem = false;
    this.methodQueue = [];
    if (triggerListener && this.queueClearedListener) {
      this.queueClearedListener();
    }
  }

  getQueue() {
    return this.methodQueue;
  }

  handleNextItem() {
    if (this.isProcessingItem) return;
    if (this.methodQueue.length == 0) return;

    this.isProcessingItem = true;

    const item = this.methodQueue[0];
    this.methodQueue = this.methodQueue.slice(1);

    if (DEBUG) console.log("Executing", item.method);

    item.method(this.onTaskEnded.bind(this, item.feeding), ...this.feed, ...item.args);
  }

  onTaskEnded(feeding, ...feed) {
    this.isProcessingItem = false;
    if (feeding) {
      this.feed = feed;
    } else {
      this.feed = [];
    }

    if (this.methodQueue.length > 0) this.handleNextItem();
    else if (this.queueClearedListener) this.queueClearedListener();
  }
}
