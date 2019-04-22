const request = require('request');

var _userName;
var _password;
var _customerId;
var _offset = 0;

const LOGIN_ENDPOINT    = '/api/v3/login';
const USERS_ENDPOINT    = '/api_v2.svc/users';
const ENCODERS_ENDPOINT = '/api_v2.svc/encoders';
const CUSTOMERS_ENDPOINT = '/api/v3/customers/';
const STREAM_PROFILES_ENDPOINT  = '/api_v2.svc/streamprofiles/';

var base = request.defaults({
    jar: true,
    baseUrl: 'https://central.livingasone.com',
    json: true,
    // proxy: 'http://127.0.0.1:8888',
    // strictSSL: false
});

async function login(userName, password, callback)
{
    _userName = userName;
    _password = password;
    
    await base.post(LOGIN_ENDPOINT, {
        body: {
            userName: _userName,
            password: _password
        }
    }, function(error, response, result)
    {
        _customerId = result.customerId;
        if(callback) callback.apply(this, arguments);
    });
}

async function reLogin(original, args)
{
    await login(_userName, _password, function(error, response, result)
    {
        _customerId = result.customerId;
        
        original.apply(this, args);
    });
}

function setOffset(offset)
{
    _offset = offset;
}

async function getUsers(callback)
{
    await base.get(USERS_ENDPOINT, callback);
}

async function getUser(id, callback)
{
    await getUsers(function(error, response, users)
    {
        for(var i in users)
        {
            var user = users[i];
            if(user.Id == id)
                return callback(error, response, user);
        }
    });
}

async function getEncoders(callback)
{
    await base.get(ENCODERS_ENDPOINT, callback);
}

async function getEvents(callback)
{
    await base.get(CUSTOMERS_ENDPOINT + _customerId + '/events', callback);
}

async function getLiveEvent(callback)
{
    getEvents(function(error, response, events)
    {
        if(response.statusCode != 200)
        {
            return reLogin(getLiveEvent, [callback]);
        }
        
        if(!events)
            return false;
        
        events  = sortEventsByDate(events);
        
        var now = new Date();
        for(var i in events)
        {
            var event = events[i];
            var start = new Date(event.startTime);
            
            if(start.getTime() < now.getTime())
            {
                return callback(error, response, event);
            }
        }
    });
}

async function getCues(eventId, callback)
{
    await base.get(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues', callback);
}

async function createCue(eventProfileId, eventId, name, position, shared, callback)
{
    if(eventProfileId == null || shared == false)
        eventProfileId  = _customerId;
    
    await base.post(STREAM_PROFILES_ENDPOINT + eventProfileId + '/events/' + eventId + '/cues', {
        body: {
                name: name,
                position: position
            }
        }, callback);
}

async function updateCue(eventId, cueId, name, position, callback)
{
    await base.patch(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues/' + cueId, {
        body: {
                name: name,
                position: position
            }
        }, callback);
}

async function deleteCue(eventId, cueId, callback)
{
    await base.delete(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues/' + cueId, callback);
}

function UTCDate(str)
{
    return new Date(str + '+0000');
}

function sortEventsByDate(events)
{
    return events.sort(function(a, b)
    {
        return UTCDate(a.startTime).getTime() - UTCDate(b.startTime).getTime();
    });
}

async function createLiveCue(name, callback)
{
    var now = new Date();
    
    await getLiveEvent(function(error, response, event)
    {
        if(event)
        {
            var start = new Date(event.startTime);
            var difference = now.getTime() - start.getTime() + _offset;
            var dif = new Date(difference);
            var position = formatTime(dif);
            
            return createCue(eventProfileId=event.eventProfileId, eventId=event.uuid, name, position, shared=false, callback);
        }
    });
}

async function deleteUnsharedCues(callback)
{
    await getLiveEvent(function(error, response, event)
    {
        if(event)
        {
            getCues(event.uuid, function(error2, response2, cues)
            {
                if(cues)
                {
                    var l = cues.length;
                    for(var i=0; i<l; i++)
                    {
                        var cue = cues[i];
                        
                        if(cue.privateCue)
                        {
                            deleteCue(event.uuid, cue.uuid);
                        }
                    }
                }
            });
        }
    });
}

function leadingZeros(value, length)
{
    if(length == undefined)
        length = 2;
    
    value = value.toString();
    for(var i=value.length; i<length; i++)
        value = '0' + value;
    
    return value;
}

function formatTime(date)
{
    return [[leadingZeros(date.getUTCHours()), leadingZeros(date.getUTCMinutes()), leadingZeros(date.getUTCSeconds())].join(':'), leadingZeros(date.getUTCMilliseconds(), 3)].join('.');
}

//  Exports
exports.login = login;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getEncoders = getEncoders;
exports.getEvents = getEvents;
exports.getLiveEvent = getLiveEvent;
exports.getCues = getCues;
exports.createCue = createCue;
exports.createLiveCue = createLiveCue;
exports.deleteCue = deleteCue;
exports.deleteUnsharedCues = deleteUnsharedCues;
exports.formatTime = formatTime;


//  demo
/*
getUsers();
login('userName', 'password', function(error, response, result){
    // getUsers();
    // getUser('123, function(error, response, user){ console.log(user); });
    createLiveCue('test', function(error, response, result){console.log(arguments)});
});
*/