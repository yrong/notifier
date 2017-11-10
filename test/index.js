const newman = require('newman');
const fs = require('fs');

describe("Notifier Integration test suite", function() {
    this.timeout(15000)

    it('notifier api', function(done) {
        newman.run({
            collection: JSON.parse(fs.readFileSync('./test/notifier.postman_collection.json','utf8')),
            environment: JSON.parse(fs.readFileSync('./config/postman_globals.json', 'utf8')),
            reporters: 'cli'
        }, function (err) {
            if (err) { done(err)}
            console.log('new api run complete!');
            done();
        });
    });
})