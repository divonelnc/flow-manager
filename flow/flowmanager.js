export default class FlowManager {
  DEBUG = false;
  warningDelay = 2000;
  methodQueue = [];
  feed = [];
  queueStartedListener = null;
  queueClearedListener = null;
  itemInProgress = null;
  warningTimeout = null;

  constructor() {
    this.displayWarning = this.displayWarning.bind(this);
  }

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
    if (this.DEBUG) console.log(method.name, "Queuing");
    this.addToQueue({ method, args });
  }

  // This item will feed the next item in the queue with parameters when calling it's onTaskEnded callback
  queueAndFeed(method, ...args) {
    if (this.DEBUG) console.log(method.name, "Queuing with feeding");
    this.addToQueue({ method, args, feeding: true });
  }

  // Instead of arguments, pass on methods that will return the arguments when called
  queueLazy(method, ...collectionMethods) {
    if (this.DEBUG) console.log(method.name, "Queuing Lazy parameters");
    this.addToQueue({ method, collectionMethods, lazy: true });
  }

  addToQueue(item) {
    if (this.DEBUG) {
      if (this.itemInProgress) console.log(" in progress:", this.itemInProgress.method.name);
      if (this.methodQueue.length)
        console.log(" in queue:", this.methodQueue.map(item => item.method.name));
    }
    this.triggerStartListener();
    this.methodQueue.push(item);
    this.handleNextItem();
  }

  clear(triggerListener) {
    if (this.DEBUG) {
      console.log("Clearing", this.methodQueue.map(item => item.method.name));
    }
    clearTimeout(this.warningTimeout);
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

    if (this.DEBUG) console.log(item.method.name, "Executing");

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

    clearTimeout(this.warningTimeout);
    this.warningTimeout = setTimeout(this.displayWarning, this.warningDelay);
    item.method(this.onTaskEnded.bind(this, item.feeding), ...this.feed, ...args);
  }

  displayWarning() {
    console.warn(
      "WARNING - FlowManager: Function",
      this.itemInProgress.method.name,
      "has been going for more than",
      this.warningDelay,
      "ms. Did you forget to call the onTaskEnded callback?"
    );
  }

  onTaskEnded(feeding, ...feed) {
    if (this.DEBUG) console.log(this.itemInProgress.method.name, "Ended task");
    clearTimeout(this.warningTimeout);
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
