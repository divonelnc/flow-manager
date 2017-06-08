export default class FlowManager {
  DEBUG = false;
  methodQueue = [];
  feed = [];
  queueStartedListener = null;
  queueClearedListener = null;
  itemInProgress = null;

  addQueueStateListeners(onQueueCleared, onQueueStarted) {
    this.queueClearedListener = onQueueCleared;
    this.queueStartedListener = onQueueStarted;
  }

  triggerStartListener() {
    if (this.methodQueue.length == 0 && this.queueStartedListener) {
      this.queueStartedListener();
    }
  }

  queue(method, ...args) {
    if (this.DEBUG) console.log("Queuing", method);
    this.triggerStartListener();

    this.methodQueue.push({ method, args });
    this.handleNextItem();
  }

  // This item will feed the next item in the queue with parameters when calling it's onTaskEnded callback
  queueAndFeed(method, ...args) {
    if (this.DEBUG) console.log("Queuing with feeding", method);
    this.triggerStartListener();

    this.methodQueue.push({ method, args, feeding: true });
    this.handleNextItem();
  }

  // Instead of arguments, pass on methods that will return the arguments when called
  queueLazy(method, ...collectionMethods) {
    if (this.DEBUG) console.log("Queuing Lazy parameters", method);
    this.triggerStartListener();

    this.methodQueue.push({ method, collectionMethods, lazy: true });
    this.handleNextItem();
  }

  clear(triggerListener) {
    this.itemInProgress = null;
    this.methodQueue = [];
    if (triggerListener && this.queueClearedListener) {
      this.queueClearedListener();
    }
  }

  getQueue() {
    return this.methodQueue;
  }

  getItemInProgress() {
    return this.itemInProgress;
  }

  handleNextItem() {
    if (this.itemInProgress) return;
    if (this.methodQueue.length == 0) return;

    const item = this.methodQueue[0];
    this.methodQueue = this.methodQueue.slice(1);

    if (this.DEBUG) console.log("Executing", item.method);

    let args = item.args;
    if (item.lazy) {
      args = [];
      for (var i = 0; i < item.collectionMethods.length; i++) {
        const collectArgument = item.collectionMethods[i];
        const collectedArg = collectArgument();
        args.push(collectedArg);
      }
    }

    this.itemInProgress = item;
    item.method(this.onTaskEnded.bind(this, item.feeding), ...this.feed, ...args);
  }

  onTaskEnded(feeding, ...feed) {
    this.itemInProgress = null;
    if (feeding) {
      this.feed = feed;
    } else {
      this.feed = [];
    }

    if (this.methodQueue.length > 0) this.handleNextItem();
    else if (this.queueClearedListener) this.queueClearedListener();
  }
}
