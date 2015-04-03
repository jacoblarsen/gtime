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
var testdate = "2015-04-15";

var hardcodedTimeZone = "Europe/Copenhagen";


// ToDay
var today = new Date(testdate);
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();



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
        getList(); // JAC: Get List On Load
    }
    else {
        authorizeText.style.display = 'block';
        authorizeButton.style.display = 'inline-block';
        authorizeButton.onclick = handleAuthClick;
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
function getList() {
    document.getElementById('currDate').innerHTML = dd + '/' + mm + ' - ' + yyyy;
    
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
                
            
                 myList += '<span class="legend" style="background-color:'+ccolor+'">&nbsp;</span>';  
                 myList += '<span class="legend entry">' + cname + '<button class="del" onclick="delCal(\''+cid+'\');this.innerHTML=\'sletter..\'">slet</button> <span class="add"><input type="time" value="09:00"/><button onclick="addEvent()">tilføj</button></span></span><br/>';  
            }
        }
        myList += '<span class="legend" style="background-color:black">&nbsp;</span>';  
        myList += '<span class="legend entry">&nbsp<input placeholder="Tilføj Nyt Projekt, ved at skrive navnet her!" id="calname" style="display:inline-block; margin-top:5px; width:400px" type="text" onchange="addCal();this.value=\'tilføjer kalender....\'"/></span>';

        document.getElementById('list').innerHTML = myList;
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
    var date = testdate; 
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


// https://www.googleapis.com/calendar/v3/calendars/2m5k99v21f1q3omi8emb32k6hg%40group.calendar.google.com/events?timeMin=2015-04-15T00%3A00%3A00Z&timeMax=2015-04-15T23%3A59%3A00Z&key={YOUR_API_KEY}
// var date = "2015-03-14";
function getEvents(id, date){
    var date = testdate; 
    var id = testid; 
    var restRequest = gapi.client.request({
        'method' : 'GET',
        'path': '/calendar/v3/calendars/'+id+'/events?timeMin='+date+'T00%3A00%3A00Z&timeMax='+date+'T23%3A59%3A00Z&timeZone='+hardcodedTimeZone+'&orderBy=startTime&singleEvents=true'
        });
    restRequest.then(function(resp) {
    
        for (var i = 0; i < resp.result.items.length; i++){
            var start = new Date(resp.result.items[i].start.dateTime);
            var end = new Date(resp.result.items[i].end.dateTime);
            var duration = new Date(end-start);

            var correction = duration.getTimezoneOffset() / 60;
            var hours = duration.getHours() + correction;
    
            console.log(resp.result.items[i].summary + " - " + start.getHours() + ":" + start.getMinutes() + " ; " +  hours + ":" + duration.getMinutes());    
        }
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
    
}

