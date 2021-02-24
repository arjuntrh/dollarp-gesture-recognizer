# $P Point Cloud Gesture Recognizer

A command line Recognition Engine of the NUI pipeline using $P algorithm.
Implemented using JavaScript (Node.js).

### To Run the Application:
1) Install [Node](https://nodejs.org/en/download/ "Node.js")
2) Place pdollar.js and input files/event streams in a folder.
3) Open a terminal inside the project folder and run the application.

#### Command formats:
* To add a new gesture: ```node pdollar -t <gesturefile>```
* To recognize a gesture: ```node pdollar <eventstream>```
* To clear gesture template: ```node pdollar -r```
