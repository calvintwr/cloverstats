'use strict';

var engine = {};
engine.intervals = 2 * 60 * 60 * 1000; // 2 hrs * 60 mins * 60s * 1000ms
engine.isRunning = false;
engine.isBusyCounter = 0;
engine.runner = require('./runner.js');
engine.start = function() {
    this.isRunning = true;
    var self = this;

    return this.runner().finally(function() {

        DEBUG('engine')('Process is complete. Downing `isRunning` flag.');

        console.log("Next run:", MOMENT().add(self.intervals/1000, 'seconds').format());
        self.isRunning = false;
        setTimeout(function() { self.restart(); }, self.intervals);

    });
};
engine.restart = function() {

    var self = this;

    // if is running
    // 1) add to busy counter
    // 2) set next run
    if(this.isRunning) {
        console.log('Engine is busy.');
        this.isBusyCounter +=1;

        if (this.isBusyCounter > 4) {
            // something is wrong, taking longer than usual to complete. Throw error to stop the whole thing.
            console.log('WARNING: Engine have been busy for', this.intervals*this.isBusyCounter/1000/60, 'minutes.');
            console.log('Breaking the engine by throwing error.');
            throw 'Failsafe stop.';
        }
        console.log("Next run:", MOMENT().add(this.intervals/1000, 'seconds').format());
        return setTimeout(function() { self.restart(); }, this.intervals);
    }

    //if not busy, run it.
    return engine.start();
}

module.exports = engine;