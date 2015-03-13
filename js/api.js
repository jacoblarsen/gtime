/*************** Google API Init() ********************/
var clientId = '817095994072-18f2oaiebj8s5861j3lvqimr5a2o4k2d.apps.googleusercontent.com';
var apiKey = 'AIzaSyA59mvSUtnZ-1wZWYuFub4QPVv2r7UCPLw';
var scopes = 'https://www.googleapis.com/auth/calendar';
var calendars;
var regregcals = new Array();


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
    if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
        getList(); // JAC: Get List On Load
    }
    else {
        authorizeButton.style.visibility = '';
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
                regregcals.push([cid,cname,ccolor]);
                 myList += '<span class="legend" style="background-color:'+ccolor+'">&nbsp;</span>';  
                 myList += '<span class="legend entry">' + cname + '<button class="del" onclick="delCal(\''+cid+'\');this.innerHTML=\'sletter..\'">slet</button> <span class="add"><input type="time" value="09:00"/> - <input type="time" value="11:00"/> <button onclick="addEvent()">tilføj</button></span></span><br/>';  
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
            'summary': 'regreg:'+title
        }
    });
    restRequest.then(function(resp) {
        location.reload();
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}

/*
* Be carefull, this really delete a calendar. 
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

// FIXME: IMPLEMENT ME
function addEvent() {
/*    var restRequest = gapi.client.request({
        'method' : 'POST',
        'path': '/calendar/v3/calendars',
        'body': {
            'summary': 'regreg:'+title,
            //'orderBy': 'best'
        }
    });
    restRequest.then(function(resp) {
        console.log("calendar added");
        
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
    */
}

