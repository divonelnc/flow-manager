# flow-manager
Simple tool to queue functions in ES6

## Queueing functions

Import the FlowManager class, then create a new instance of `FlowManager` and use the `queue` function to queue your asynchronious function

`import FlowManager from "../flow/flowmanager";`

```
this.flowManager = new FlowManager();
this.flowManager.queue( myAsynchroniousFunction, parameter );
this.flowManager.queue( secondFunctionToExecute, parameterA, parameterB );
this.flowManager.queue( thirdFunctionToExecute, parameter );
```


### IMPORTANT:
All functions that you want to queue must have a callback function has their first parameter. 
This callback needs to be called when the function is done executing, so that the flow manager can move to the next item in the queue.

```
myAsynchroniousFunction( onTaskEnded, parameter )
{
    // Asynchronious task
    ...
    
    onTaskEnded();
}
```
