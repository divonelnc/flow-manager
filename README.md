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
All functions that you want to queue must have a callback function as their first parameter. 
This callback then needs to be called when the function is done executing, so that the flow manager can move to the next item in the queue.

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

## Queue Lazy

Allow you to read the argument for queued function only when the function is being called

```
this.value = "Hello";
this.flowManager.queue( changeValue, "How are you?" );
this.flowManager.queue( readValue, this.value); // Will log the value at the time of starting the queue: "Hello";
this.flowManager.queueLazy( readValue, () => this.value ); // Will log the value at the time of call: "How are you?";
```

```
function changeValue( onTaskEnded, newValue )
{
    // Asynchonous change of value    
    //....    
    this.value = newValue;    
    onTaskEnded();
}

function readState( onTaskEnded, valueToRead )
{
    console.log(valueToRead);
    onTaskEnded();
}
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

## Clearing

You can clear the queue to stop it from processing further items by calling:

```
this.flowManager.clear()
this.flowManager.clear(true) // True: Will trigger the onQueueEnded listener after clearing the queue
```


# Installation: npm
```
npm install easy-flow-manager
```
