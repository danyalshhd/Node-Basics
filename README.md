Use of async, rsvp, rxjs with node to get the title of any website.

## Install
To install the dependencies:

    npm install

## Start Server
To start the server:

    npm start

##Example
Run following example commands for each of the questions:
http://localhost:8080/**test-1**/I/want/title/?address=www.google.com.pk
http://localhost:8080/test-2/I/want/title/?address=www.google.com.pk&address=www.dawn.com/events
http://localhost:8080/test-3/I/want/title/?address=www.google.com.pk&address=www.dawn.com/events
http://localhost:8080/bonus/I/want/title/?address=www.google.com.pk&address=www.dawn.com/events

## Directory Structure
The code structure is as follows:

    /controllers
    	bonus.js
		test-1.js 
		test-2.js
		test-3.js
	/lib
		Utility.js  --helper methods for controllers
    /routes
        index.js    -- links controller to routes
    /views
    	View.js     --helper methods for controllers to show view
    .gitignore      --added nodemodules in it
    package.json
    README.md


