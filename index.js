const request = require('request');

var _userName;
var _password;
var _customerId;

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
        if(callback) callback(error, response, result);
    });
}

async function reLogin(original, args)
{
    await login(_userName, _password, function(error, response, result)
    {
        original.apply(args);
    });
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

async function getCues(eventId, callback)
{
    await base.get(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues', callback);
}

async function createCue(eventId, name, position, shared, callback)
{
    await base.post(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues', {
        body: {
                name: name,
                position: position,
                shared: true,
                privateCue: false
            }
        }, callback);
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
    getEvents(function(error, response, events)
    {
        if(response.statusCode != 200)
        {
            return reLogin(createLiveCue, arguments);
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
                var difference = now.getTime() - start.getTime();
                var dif = new Date(difference);
                var position = [leadingZeros(dif.getUTCHours()), leadingZeros(dif.getUTCMinutes()), leadingZeros(dif.getUTCSeconds())].join(':') + '.' + leadingZeros(dif.getUTCMilliseconds(), 3);
                
                return createCue(event.uuid, name, position, shared=false, callback);
            }
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

//  Exports
exports.login = login;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getEncoders = getEncoders;
exports.getEvents = getEvents;
exports.getCues = getCues;
exports.createCue = createCue;
exports.createLiveCue = createLiveCue;


//  demo
/*
getUsers();
login('userName', 'password', function(error, response, result){
    // getUsers();
    // getUser(1, function(error, response, user){ console.log(user); });
    createLiveCue('test', function(error, response, result){console.log(arguments)});
});
*/