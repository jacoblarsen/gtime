/************** Prototype extending functions ***************/
Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

Date.prototype.addMinutes= function(m){
    this.setMinutes(this.getMinutes()+m);
    return this;
}



/*************** Just vars *************/
var calendars;
var regregcals = new Array();

var testid = "";
var currdate = "2015-04-15";

var hardcodedTimeZone = "Europe/Copenhagen";

// ToDay
var today = new Date();


/**************** handlers *****************/

function splashHandlers(){
    document.getElementById('authorize-button').onclick = handleAuthClick;
}

function contentHandlers(){
    document.getElementById('nextDate').onclick = function(){
        today.setDate(today.getDate() + 1);
        getEvents(today);
    };
    
    document.getElementById('prevDate').onclick = function(){
        today.setDate(today.getDate() - 1);
        getEvents(today);
    };
    
    document.getElementById('today').onclick = function(){
        today = new Date();
        getEvents(today);
    };
    
    document.getElementById('addEventPlus').onclick = function(){
        document.getElementById('listOfCalendars').style.display = 'block';
        document.getElementById('addEventPlus').style.display = 'none';
        document.getElementById('addEventMinus').style.display = 'block';
    }
    
    document.getElementById('addEventMinus').onclick = function(){
        document.getElementById('listOfCalendars').style.display = 'none';
        document.getElementById('addEventPlus').style.display = 'block';
        document.getElementById('addEventMinus').style.display = 'none';
    }
    
}


//FIXME Handle click on calendar name
function hello(){
    alert("hello");
}

/*************** Google API Init() ********************/
var clientId = '817095994072-18f2oaiebj8s5861j3lvqimr5a2o4k2d.apps.googleusercontent.com';
var apiKey = 'AIzaSyA59mvSUtnZ-1wZWYuFub4QPVv2r7UCPLw';
var scopes = 'https://www.googleapis.com/auth/calendar';


function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
}

function checkAuth() {
    gapi.auth.authorize({
        client_id: clientId,
        scope: scopes,
        immediate: true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    var authorizeText = document.getElementById('authorize-text');
    
    if (authResult && !authResult.error) {
        document.getElementById('regSplash').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        contentHandlers();
        initCalendars(); // JAC: Get List On Load
    }
    else {
        authorizeText.style.display = 'block';
        authorizeButton.style.display = 'inline-block';
        splashHandlers();
    }
}

function handleAuthClick(event) {
    // Step 3: get authorization to use private data
    gapi.auth.authorize({
        client_id: clientId,
        scope: scopes,
        immediate: false
    }, handleAuthResult);
    return false;
}

/********** JAC : CUSTOM API CALLS ***************/

/*
* Get The list af calendars, and list them with some fuctionality
*/
function initCalendars() {
    
    var restRequest = gapi.client.request({
        'path': '/calendar/v3/users/me/calendarList'
        
    });
    restRequest.then(function(resp) {
        calendars = resp.result;
        console.log(calendars);
        var myList = "";
        for (var i = 0; i < calendars.items.length ; i++){
            if(calendars.items[i].summary.startsWith('regreg:')){ // Only choose our own calendars
                var cname = calendars.items[i].summary.substring(7);
                var ccolor = calendars.items[i].backgroundColor;
                var cid = calendars.items[i].id;
                testid = cid;
                regregcals.push([cid,cname,ccolor]);
                var li = document.createElement('li');
                li.innerHTML = cname;
                li.setAttribute("class","calendaritem");
                li.style.backgroundColor = ccolor;
                li.onclick = hello;
                document.getElementById('listOfCalendars').appendChild(li);
            }
        }
        getEvents(today);
        
        //myList += '<span class="legend" style="background-color:black">&nbsp;</span>';  
        //myList += '<span class="legend entry">&nbsp<input placeholder="Tilføj Nyt Projekt, ved at skrive navnet her!" id="calname" style="display:inline-block; margin-top:5px; width:400px" type="text" onchange="addCal();this.value=\'tilføjer kalender....\'"/></span>';

        
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}

/*
* Add a calendar with the name regreg:{title}
*/
function addCal() {
    var title = document.getElementById('calname').value;
    var restRequest = gapi.client.request({
        'method' : 'POST',
        'path': '/calendar/v3/calendars',
        'body': {
            'summary': 'regreg:'+title,
             "timeZone": hardcodedTimeZone //FIXME, jac: Hardcoded timezone
        }
    });
    restRequest.then(function(resp) {
        location.reload();
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}

/*
* Be carefull, this really deletes a calendar. 
*/
function delCal(id) {
    var restRequest = gapi.client.request({
        'method' : 'DELETE',
        'path': '/calendar/v3/calendars/'+id
    });
    restRequest.then(function(resp) {
        location.reload();
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}

// 
// var date = "2015-03-14";
// var starttime = 11.30;
// var duration = 1.30;         
function addEvent(id, date, starttime, duration) {
    
    //defaults for testing
    var date = today; 
    var id = testid;
    
    
    var starttime = "11.15";
    var duration = "1.30"; 
    
    
    // getting minutes and hours as numbers 
    // FIXME: separate all this into util function 
    var startTimeH = parseInt(starttime.indexOf('.')>-1 ? starttime.substring(0,starttime.indexOf('.')) : starttime);
    var startTimeM = parseInt(starttime.indexOf('.')>-1 ? starttime.substring(starttime.indexOf('.') +1 ) : "0");
    
    // getting minutes and hours as numbers
    var durationH = parseInt(duration.indexOf('.')>-1 ? duration.substring(0,duration.indexOf('.')) : duration);
    var durationM = parseInt(duration.indexOf('.')>-1 ? duration.substring(duration.indexOf('.') +1 ) : "0");
    
    var starttimeDate = new Date(Date.parse(date));
    starttimeDate.setHours(startTimeH);
    starttimeDate.setMinutes(startTimeM);
    var starttimeString = starttimeDate.toISOString();
    
    var endtimeDate = starttimeDate.addHours(durationH);
    endtimeDate.addMinutes(durationM);
    var endtimeString = endtimeDate.toISOString();
    
    console.log(starttimeString);
    
    var restRequest = gapi.client.request({
        'method' : 'POST',
        'path': '/calendar/v3/calendars/'+id+'/events',
        'body': 
            {
            //"end":   { "dateTime": "2015-04-14T13:00:00Z" },
            'end':   { 'dateTime': endtimeString },
            //"start": { "dateTime": "2015-04-14T10:00:00Z" },
            'start': { 'dateTime': starttimeString },
            'summary': 'Projekttid'
            },
        });
    restRequest.then(function(resp) {
        console.log("Calender Event  Added");
        
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
    
}


function getEvents(dateObject){
    
    document.getElementById('listOfEvents').innerHTML = '';
    mm = dateObject.getMonth() +1;
    dd = dateObject.getDate();
    yyyy = dateObject.getFullYear();
    var date = yyyy + "-" + mm + "-"+dd;
    document.getElementById('currDate').innerHTML = dd + '/' + mm + ' - ' + yyyy;
    for(var j = 0; j < regregcals.length; j++){
        var cid = regregcals[j][0];
        var cname = regregcals[j][1];
        var ccolor = regregcals[j][2];
        var restRequest = gapi.client.request({
        'method' : 'GET',
        'path': '/calendar/v3/calendars/'+cid+'/events?timeMin='+date+'T00%3A00%3A00Z&timeMax='+date+'T23%3A59%3A00Z&timeZone='+hardcodedTimeZone+'&orderBy=startTime&singleEvents=true'
        });
        restRequest.then(function(resp) {
            for (var i = 0; i < resp.result.items.length; i++){
                var start = new Date(resp.result.items[i].start.dateTime);
                var end = new Date(resp.result.items[i].end.dateTime);
                var duration = new Date(end-start);
                var correction = duration.getTimezoneOffset() / 60;
                var hours = duration.getHours() + correction;
                var li = '<li style="background-color:'+ccolor+'">'+cname+ ' fra kl. ' + start.getHours() + ":" + start.getMinutes() + " i " +  hours + "." + duration.getMinutes() + ' timer</li>';  
                document.getElementById('listOfEvents').innerHTML += li;
            }
        }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
        });   
    }
}

