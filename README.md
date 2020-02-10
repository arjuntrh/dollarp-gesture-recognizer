# dollarp-Gesture-Recognizer

A command line Recognition Engine of the NUI pipeline using $P algorithm.
Implemented using JavaScript (Node.js).

#### To execute the application:
1) Install [Node](https://nodejs.org/en/download/ "Node.js")
2) Place pdollar.js and input files/event streams in a folder.
3) Open command prompt, navigate to the above folder and run the application.

#### Command format:
* To add a new gesture: node pdollar -t `<gesturefile>`
* To recognize a gesture: node pdollar `<eventstream>`
* To clear gesture template: node pdollar -r
