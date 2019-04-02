var poll = ''
    , dbActions = require('./../persist.js')
    , tally = require('./../tally.js')
    , activePoll = ''
    , redis = require('redis')
    , triggerWord = ''
    , channelId = ''
    , slackRes = ''
    , rtg = ''
    , newPollID = ''
    , ts = Math.floor(Date.now() / 1000);

exports.post = function (req, res, next) {

    console.log('Start vote route.');

    /*
     * Start poll data.
     */
    triggerWord = req.body.trigger_word;
    channelId = req.body.channel_id;
    poll = {
        'pollName': 'Next Brown Bag Options',
        'active': 1,
        'answers': []
    };

    newPollID = 'activePoll_' + channelId;

    /*
     * Fetch and print current active poll.
     */
    dbActions.getPoll(newPollID, listActivePoll);
    function listActivePoll(data) {
        console.log('Current Brown Bag Poll: ' + data);
        if (data === null) {
            console.log('There is no active Brown Bag poll, setting up new poll.');
        } else {
            console.log('Current Brown Bag poll is closing.');
            slackRes = 'Closing Active Brown Bag Poll. Here were the results of the poll.\n' + tally.printPoll(JSON.parse(data)) + '\n';
        }
    }

    /*
     * Set new poll with the active poll id.
     * Print confirmation and vote message.
     */
    console.log('Setting up new Brown Bag poll with ID: ' + newPollID);
    dbActions.setPoll(newPollID, JSON.stringify(poll), printNewPoll);

    function printNewPoll() {
        console.log('The new Brown Bag poll is set up with the ID: ' + newPollID);
        dbActions.getPoll(newPollID, confirmNewPoll);
    }

    function confirmNewPoll(data) {
        slackRes += '\nThe brown bag poll is set up. Please start voting for ' + tally.printPoll(JSON.parse(data));
        res.json({ text: slackRes });
    }

};