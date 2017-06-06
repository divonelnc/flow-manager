# flow-manager
Simple tool to queue functions in ES6

## Queueing functions

Import the FlowManager class, then create a new instance of `FlowManager` and use the `queue` function to queue your asynchronous functions

```
import FlowManager from "../flow/flowmanager";
```

```
this.flowManager = new FlowManager();
this.flowManager.queue( myAsynchronousFunction, parameter );
this.flowManager.queue( secondFunctionToExecute, parameterA, parameterB );
this.flowManager.queue( thirdFunctionToExecute, parameter );
```


### IMPORTANT:
All functions that you want to queue must have a callback function has their first parameter. 
This callback needs to be called when the function is done executing, so that the flow manager can move to the next item in the queue.

```
function myAsynchronousFunction( onTaskEnded, parameter ){
    // Asynchronous task
    ...
    
    onTaskEnded();
}
```

## Queue and feed

You can also have a queued function feed the next function in the queue with parameters

```
this.flowManager.queueAndFeed( myQuery );
this.flowManager.queue( queryResultDependentFunc );
```

```
function myQuery( feed ){
    var onQuerySucces = function( result ){
        feed(result);
    }
    
    asynchronousQuery( onQuerySucces );    
}

function queryResultDependentFunc( onTaskEnded, queryResult ){
    console.log(queryResult)
    onTaskEnded();
}
```

## Clearing

You can clear the queue to stop it from processing further items by calling:

```
this.flowManager.clear()
```

## Listening to the queue state

Listening to the queue state can be useful if, for example, you want to implement a "loading" message

```
this.flowManager.addQueueStateListeners( onQueueEnded, onQueueStarted);
```

```
function onQueueStarted(){
    this.isLoading = true;
}
function onQueueEnded(){
    this.isLoading = false;
}
```


# Installation: npm
```
npm install easy-flow-manager
```
