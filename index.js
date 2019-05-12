const request = require('request');

/**
 * @type {string}
 * @private
 */
let _userName;

/**
 * @type {string}
 * @private
 */
let _password;

/**
 * @type {string}
 * @private
 */
let _customerId;

/**
 * Time offset for live cues
 * @type {number}
 * @private
 */
let _offset = 0;

const LOGIN_ENDPOINT    = '/api/v3/login';
const USERS_ENDPOINT    = '/api_v2.svc/users';
const ENCODERS_ENDPOINT = '/api_v2.svc/encoders';
const CUSTOMERS_ENDPOINT = '/api/v3/customers/';
const STREAM_PROFILES_ENDPOINT  = '/api_v2.svc/streamprofiles/';

const base = request.defaults({
    jar: true,
    baseUrl: 'https://central.livingasone.com',
    json: true,
    // proxy: 'http://127.0.0.1:8888',
    // strictSSL: false
});


/**
 * Log in to your encoder
 * @param {string} userName
 * @param {string} password
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function login(userName, password, callback=null)
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
        if(result)
            _customerId = result.customerId;

        if(callback)
            callback.apply(this, arguments);
    });
}

/**
 * Re-login
 * @param {function} original
 * @param {Array} args
 * @returns {Promise<void>}
 */
async function reLogin(original, args)
{
    await login(_userName, _password, function(error, response, result)
    {
        if(result)
            _customerId = result.customerId;
        
        original.apply(this, args);
    });
}

/**
 * Set time offset for setting live cues
 * @param {number} offset
 */
function setOffset(offset)
{
    _offset = offset;
}

/**
 * Get list of users in your environment
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getUsers(callback)
{
    await base.get(USERS_ENDPOINT, callback);
}

/**
 * Get single user
 * @param {string} id
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getUser(id, callback)
{
    await getUsers(function(error, response, users)
    {
        if(users)
        {
            for(let i in users)
            {
                let user = users[i];
                if(user.Id === id)
                    return callback(error, response, user);
            }
        }
    });
}

/**
 * Get list of encoders
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getEncoders(callback)
{
    await base.get(ENCODERS_ENDPOINT, callback);
}

/**
 * Get list of events
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getEvents(callback)
{
    await base.get(CUSTOMERS_ENDPOINT + _customerId + '/events', callback);
}

/**
 * Get current ongoing event
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getLiveEvent(callback)
{
    await getEvents(function (error, response, events) {
        if (!response || response.statusCode !== 200) {
            return reLogin(getLiveEvent, [callback]);
        }

        if (events) {
            events = sortEventsByDate(events);

            const now = new Date();
            for (let i in events) {
                let event = events[i];
                let start = new Date(event.startTime);

                if (start.getTime() < now.getTime()) {
                    return callback(error, response, event);
                }
            }
        }

        return false;
    });
}

/**
 * Get cues
 * @param {string} eventId
 * @param {function} callback
 * @returns {Promise<void>}
 */
async function getCues(eventId, callback)
{
    await base.get(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues', callback);
}

/**
 * Create a new cue
 * @param {string} eventProfileId
 * @param {string} eventId
 * @param {string} name
 * @param {string} position
 * @param {boolean} shared
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function createCue(eventProfileId, eventId, name, position, shared, callback=null)
{
    if(eventProfileId == null || shared === false)
        eventProfileId  = _customerId;
    
    await base.post(STREAM_PROFILES_ENDPOINT + eventProfileId + '/events/' + eventId + '/cues', {
        body: {
                name: name,
                position: position
            }
        }, callback);
}

/**
 * Update an existing cue
 * @param {string} eventId
 * @param {string} cueId
 * @param {string} name
 * @param {string} position
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function updateCue(eventId, cueId, name, position, callback=null)
{
    await base.patch(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues/' + cueId, {
        body: {
                name: name,
                position: position
            }
        }, callback);
}

/**
 * Delete an existing cue
 * @param {string} eventId
 * @param {string} cueId
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function deleteCue(eventId, cueId, callback=null)
{
    await base.delete(STREAM_PROFILES_ENDPOINT + _customerId + '/events/' + eventId + '/cues/' + cueId, callback);
}

/**
 * Convert timezone-less date to UTC date
 * @private
 * @param {string} str
 * @returns {Date}
 */
function UTCDate(str)
{
    return new Date(str + '+0000');
}

/**
 * Sort events by start date/time
 * @param {Array} events
 * @returns {Array}
 */
function sortEventsByDate(events)
{
    return events.sort(function(a, b)
    {
        return UTCDate(a.startTime).getTime() - UTCDate(b.startTime).getTime();
    });
}

/**
 * Create a cue in the current ongoing event
 * @param {string} name
 * @param {boolean} shared
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function createLiveCue(name, shared=false, callback=null)
{
    const now = new Date();
    
    await getLiveEvent(function(error, response, event)
    {
        if(event)
        {
            const start = new Date(event.startTime);
            const difference = now.getTime() - start.getTime() + _offset;
            const dif = new Date(difference);
            const position = formatTime(dif);
            
            return createCue(event.eventProfileId, event.uuid, name, position, shared, callback);
        }
    });
}

/**
 * Cleanup all cues that are not shared
 * @param {null|function} callback
 * @returns {Promise<void>}
 */
async function deleteUnsharedCues(callback=null)
{
    await getLiveEvent(async function(error, response, event)
    {
        if(event)
        {
            await getCues(event.uuid, async function(error2, response2, cues)
            {
                if(cues)
                {
                    let l = cues.length;
                    for(let i=0; i<l; i++)
                    {
                        let cue = cues[i];
                        
                        if(cue.privateCue === true)
                        {
                            await deleteCue(event.uuid, cue.uuid);
                        }
                    }
                }
            });
        }
    });
}

/**
 * Format a number with leading zeros
 * @private
 * @param {number|string} value
 * @param {int} length
 * @returns {string}
 */
function leadingZeros(value, length=2)
{
    value = value.toString();
    for(let i=value.length; i<length; i++)
        value = '0' + value;
    
    return value.toString();
}

/**
 * Format a time as string value
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date)
{
    return [[leadingZeros(date.getUTCHours()), leadingZeros(date.getUTCMinutes()), leadingZeros(date.getUTCSeconds())].join(':'), leadingZeros(date.getUTCMilliseconds(), 3)].join('.');
}

//  Exports
exports.login = login;
exports.setOffset = setOffset;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getEncoders = getEncoders;
exports.getEvents = getEvents;
exports.getLiveEvent = getLiveEvent;
exports.getCues = getCues;
exports.createCue = createCue;
exports.createLiveCue = createLiveCue;
exports.updateCue = updateCue;
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