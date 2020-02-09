
/**
 * The $P Point-Cloud Recognizer (JavaScript version)
 *
 *  Radu-Daniel Vatavu, Ph.D.
 *  University Stefan cel Mare of Suceava
 *  Suceava 720229, Romania
 *  vatavu@eed.usv.ro
 *
 *  Lisa Anthony, Ph.D.
 *  UMBC
 *  Information Systems Department
 *  1000 Hilltop Circle
 *  Baltimore, MD 21250
 *  lanthony@umbc.edu
 *
 *  Jacob O. Wobbrock, Ph.D.
 *  The Information School
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  wobbrock@uw.edu
 *
 * The academic publication for the $P recognizer, and what should be
 * used to cite it, is:
 *
 *     Vatavu, R.-D., Anthony, L. and Wobbrock, J.O. (2012).
 *     Gestures as point clouds: A $P recognizer for user interface
 *     prototypes. Proceedings of the ACM Int'l Conference on
 *     Multimodal Interfaces (ICMI '12). Santa Monica, California
 *     (October 22-26, 2012). New York: ACM Press, pp. 273-280.
 *     https://dl.acm.org/citation.cfm?id=2388732
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2012, Radu-Daniel Vatavu, Lisa Anthony, and
 * Jacob O. Wobbrock. All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University Stefan cel Mare of Suceava,
 *	University of Washington, nor UMBC, nor the names of its contributors
 *	may be used to endorse or promote products derived from this software
 *	without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Radu-Daniel Vatavu OR Lisa Anthony
 * OR Jacob O. Wobbrock BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
**/

/**CITATIONS :
 *
 * Source Code has been taken from the following link :
 * http://depts.washington.edu/acelab/proj/dollar/pdollar.js
 * http://depts.washington.edu/madlab/proj/dollar/pdollar.html 
 * 
 */
//

/**Source Code Starts here */
// Point class
//
function Point(x, y, id) // constructor
{
	this.X = x;
	this.Y = y;
	this.ID = id; // stroke ID to which this point belongs (1,2,3,etc.)
}
//
// PointCloud class: a point-cloud template
//
function PointCloud(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	this.Points = Scale(this.Points);
	this.Points = TranslateTo(this.Points, Origin);
}
//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// PDollarRecognizer constants
//
//const NumPointClouds = 16;
const NumPoints = 32;
const Origin = new Point(0, 0, 0);
//
// PDollarRecognizer class
//
function PDollarRecognizer() // constructor
{
	//
	// one predefined point-cloud for each gesture
	//
	this.PointClouds = new Array();

	// The $P Point-Cloud Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), DeleteUserGestures()
	//

	this.Recognize = function (points) {

		var t0 = Date.now();
		var candidate = new PointCloud("", points);

		var u = -1;
		var b = +Infinity;
		// console.log(this.PointClouds);
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = GreedyCloudMatch(candidate.Points, this.PointClouds[i]);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		var t1 = Date.now();
		return (u == -1) ? new Result("No match.", 0.0, t1 - t0) : new Result(this.PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1 - t0);
	}

	this.AddGesture = function (name, points) {
		this.PointClouds[this.PointClouds.length] = new PointCloud(name, points);
		var num = 0;
		for (var i = 0; i < this.PointClouds.length; i++) {
			if (this.PointClouds[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function () {
		this.PointClouds.length = NumPointClouds; // clears any beyond the original set
		return NumPointClouds;
	}
}
//
// Private helper functions from here on down
//
function GreedyCloudMatch(points, P) {
	var e = 0.50;
	var step = Math.floor(Math.pow(points.length, 1.0 - e));
	var min = +Infinity;
	for (var i = 0; i < points.length; i += step) {
		var d1 = CloudDistance(points, P.Points, i);
		var d2 = CloudDistance(P.Points, points, i);
		min = Math.min(min, Math.min(d1, d2)); // min3
	}
	return min;
}

function CloudDistance(pts1, pts2, start) {
	var matched = new Array(pts1.length); // pts1.length == pts2.length
	for (var k = 0; k < pts1.length; k++)
		matched[k] = false;
	var sum = 0;
	var i = start;
	do {
		var index = -1;
		var min = +Infinity;
		for (var j = 0; j < matched.length; j++) {
			if (!matched[j]) {
				var d = Distance(pts1[i], pts2[j]);
				if (d < min) {
					min = d;
					index = j;
				}
			}
		}
		matched[index] = true;
		var weight = 1 - ((i - start + pts1.length) % pts1.length) / pts1.length;
		sum += weight * min;
		i = (i + 1) % pts1.length;
	} while (i != start);
	return sum;
}
function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i - 1].ID) {
			var d = Distance(points[i - 1], points[i]);
			if ((D + d) >= I) {
				var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
				var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
				var q = new Point(qx, qy, points[i].ID);
				newpoints[newpoints.length] = q; // append new point 'q'
				points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
				D = 0.0;
			}
			else D += d;
		}
	}
	if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].ID);
	return newpoints;
}
function Scale(points) {
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	var size = Math.max(maxX - minX, maxY - minY);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - minX) / size;
		var qy = (points[i].Y - minY) / size;
		newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid to pt
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function Centroid(points) {
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y, 0);
}
function PathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i - 1].ID)
			d += Distance(points[i - 1], points[i]);
	}
	return d;
}
function Distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}

//------------- /* Source Code Ends here */---------------------------------------------

/** File Handling and Gesture Recognition */
var readFileObject = require('fs');
var pDollarObject = new PDollarRecognizer();

/**Peform the operations based on the arguments */
if (process.argv.length <= 2) {
	var Help = "Welcome to the Help Screen\r\n" +
			   "Use the following commands to perform the operations \r\n" +
			   "1. To add gesture : node pdollar -t <gesturefile> \r\n" +
			   "2. To clear templates : node pdollar -r \r\n" +
			   "3. To recognize gesture : node pdollar <eventstream> \r\n";

	console.log(Help);
}
else {
	var argumentType = process.argv[2];
	switch (argumentType) {
		case "-t": {
			//console.log("command t");
			addGestureTemplates();
			break;
		}
		case "-r": {
			//console.log("command r");
			clearGestureTemplates();
			break;
		}
		default: {
			//console.log("command recognize");
			recognizeGestureTemplates();
		}
	}
}

function checkIfFIleExists() {
	try {
		if (readFileObject.existsSync('gestureTemplates.txt')) {
			//console.log("The file exists.");
			return true;
		} else {
			//console.log('The file does not exist.');
			return false;
		}
	}
	catch (error) {
		console.error(error);
	}
	return false;
}

function checkIfGestureExists(searchGesture) {

	if (checkIfFIleExists()) {
		//console.log("file exists - true");
		var fileContent = readFileObject.readFileSync('gestureTemplates.txt').toString();
		if (fileContent.includes(searchGesture)) {
			//console.log("gesture exists - true");
			return true;
		}
		else {
			//console.log("gesture exists - false");
			return false;
		}
	}
	else {
		//console.log("new file");
		return false;
	}

}

function addGestureTemplates() {
	var gestureFile = readFileObject.readFileSync(process.argv[3]).toString();
	var gestureFileContent = readFileObject.readFileSync(process.argv[3]).toString().split("\r\n");

	/**To differentiate a gesture file and an event file
	 * check first line of the file
	 * If it is MOUSEDOWN command, then it is an event file
	 * Otherwise it is a gesture file
	 * Add gesture file to persistent memory i.e. gestureTemplatesFile
	 */
	if (gestureFileContent[0] !== "MOUSEDOWN") {
		var isDuplicate = checkIfGestureExists(gestureFileContent[0]);
		//console.log(isDuplicate);
		if (isDuplicate) {
			console.log("Gesture file is already present in the gesture templates !!");
		}
		else {
			//console.log("gesture does not exists");
			var gesturePrefix = "Suffix@#" + gestureFileContent[0] + "\r\n";
			readFileObject.appendFileSync('gestureTemplates.txt', gesturePrefix);
			readFileObject.appendFileSync('gestureTemplates.txt', gestureFile);
			readFileObject.appendFileSync('gestureTemplates.txt', '\r\nEndOfGesture\r\n');
		}
	}
	else {
		console.log("Event file cannot be added to Gesture Templates!");
	}
}

function clearGestureTemplates() {
	try {
		if (checkIfFIleExists()) {
			readFileObject.unlinkSync('gestureTemplates.txt');
		}
		else {
			console.log("Gesture template is empty, nothing to clear!");
		}
	}
	catch (error) {
		console.error(error);
	}
}

function splitPoints(points) {
	var pointsArray = points.split(",");
	var xPoint = parseInt(pointsArray[0]);
	var yPoint = parseInt(pointsArray[1]);
	return {
		xPoint: xPoint,
		yPoint: yPoint
	}
}

function constructEventPointCloud() {
	/** First read the event file */

	var eventFileContent = readFileObject.readFileSync(process.argv[2]).toString().split("\r\n");
	var EventStrokeNumber = 0;
	var eventFilePoints = [];
	for (var i = 0; i < eventFileContent.length; i++) {
		if (eventFileContent[i] === "MOUSEDOWN") {
			EventStrokeNumber++;
		} else if (eventFileContent[i] === "RECOGNIZE") {
			var recognitionResult = pDollarObject.Recognize(eventFilePoints);
			console.log("Recognized Gesture: ", recognitionResult.Name);
			EventStrokeNumber = 0;
			eventFilePoints = [];
		} else if (eventFileContent[i] != "MOUSEUP" && eventFileContent[i] != "") {
			var eventPoints = splitPoints(eventFileContent[i]);
			eventFilePoints.push(new Point(eventPoints.xPoint, eventPoints.yPoint, EventStrokeNumber));
		}
	}
}


function recognizeGestureTemplates() {

	pDollarObject.PointClouds = [];
	var pointCloudIndex = 0;

	/* Check if file exists
	 * If exists, then read the gesture templates files */
	if (checkIfFIleExists()) {
		var gestureTemplatesContent = readFileObject.readFileSync('gestureTemplates.txt').toString().split("\r\n");


		/**Loop through the gesture files and add each gesture to PointCloud */
		for (var i = 0; i < gestureTemplatesContent.length; i++) {
			if (gestureTemplatesContent[i].includes("Suffix@#")) {
				var gestureStrokeNumber = 0;
				var gestureTemplatePoints = [];
				var gestureTitle = gestureTemplatesContent[i].slice(8);

				var j = i + 2;
				while (gestureTemplatesContent[j] !== "EndOfGesture") {
					if (gestureTemplatesContent[j] === "BEGIN") {
						gestureStrokeNumber++;
					}
					else if (gestureTemplatesContent[j] != "END" && gestureTemplatesContent[j] != "") {
						var gesturePoints = splitPoints(gestureTemplatesContent[j]);
						gestureTemplatePoints.push(new Point(gesturePoints.xPoint, gesturePoints.yPoint, gestureStrokeNumber));
					}
					j++;
				}

				pDollarObject.PointClouds[pointCloudIndex] = new PointCloud(gestureTitle, gestureTemplatePoints);
				i = j;
				pointCloudIndex++;
			}
			else {
				i++;
			}
		}

		constructEventPointCloud();
	}
	else {
		constructEventPointCloud();
	}
}


