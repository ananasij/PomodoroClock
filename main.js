var pomodoro;

function init() {
    pomodoro = new Pomodoro();
    pomodoro.on('timeLeftChange', renderTimer);
    pomodoro.on('phaseChange', renderCurrentTimerName);
    pomodoro.on('stateChange', renderSwitchBtn);

    renderTimerLength('workTimer');
    renderTimerLength('restTimer');
    renderCurrentTimerName();
    renderTimer();

    $('.js-btn-updateTimer').on('click', function(e) {
        var timer = $(e.target).data('timer');
        var update;
        if ($(e.target).data('update') === 'plus') {
            update = 1;
        } else {
            update = -1;
        }
        pomodoro.updateTimer(timer, update);
        renderTimerLength(timer);
    });

    $('.js-switch').on('click', function() {
        pomodoro.toggleTimerState();
    });

    $('.js-btn-reset').on('click', function() {
        pomodoro.resetCountdown();
    });
}

function renderTimerLength(timer) {
    var $timer;
    if (timer === 'workTimer') {
        $timer = $('.js-workTimerLength');
    } else {
        $timer = $('.js-restTimerLength');
    }
    $timer.text(formatTime(pomodoro[timer]));
}

function renderTimer() {
    $('.js-timer').text(formatTime(pomodoro.timeLeft));
}

function formatTime(seconds) {
    var toFormat = seconds;
    var prettyTime = [];
    for (var i = 2; i >= 0; i--) {
        prettyTime[i] = toFormat % 60;
        toFormat = Math.floor(toFormat / 60);
    }
    if (prettyTime[0] === 0) {
        prettyTime.shift();
    }
    for (var j = prettyTime.length - 1; j > 0; j--) {
        if (prettyTime[j].toString().length === 1) {
            prettyTime[j] = '0' + prettyTime[j];
        }
    }
    prettyTime = prettyTime.join(':');
    return prettyTime;
}

function renderCurrentTimerName() {
    var currentTimer = '';
    if (pomodoro.phase === Pomodoro.PHASE_WORK) {
        currentTimer = 'Work session';
    } else {
        currentTimer = 'Rest';
    }

    $('.js-currentTimerName').text(currentTimer);
}

function renderSwitchBtn() {
    var currentAction = '';
    if (pomodoro.state === Pomodoro.STATE_COUNTDOWN) {
        currentAction = 'Pause';
    } else {
        currentAction = 'Start';
    }

    $('.js-btn-switch').text(currentAction);
}

$(document).ready(init);

// Pomodoro

function Pomodoro() {
    this.state = null;
    this.phase = null;
    this.timeLeft = 0;

    this.workTimer = 0.15 * 60;
    this.restTimer = 0.1 * 60;
    this.callbacks = {
        timeLeftChange: null,
        phaseChange: null,
        stateChange: null
    };
    this.resetCountdown();
}

Pomodoro.STATE_COUNTDOWN = 'STATE_COUNTDOWN';
Pomodoro.STATE_PAUSE = 'STATE_PAUSE';
Pomodoro.STATE_START = 'STATE_START';
Pomodoro.PHASE_WORK = 'PHASE_WORK';
Pomodoro.PHASE_REST = 'PHASE_REST';
Pomodoro.TIMER_DELAY = 1000;
Pomodoro.TIMER_UPDATE_SCALE = 60;

Pomodoro.prototype.resetCountdown = function() {
    this.setState(Pomodoro.STATE_START);
    this.setPhase(Pomodoro.PHASE_WORK);
    this.setTimeLeft(this.workTimer);
    clearInterval(this.timerID);
};

Pomodoro.prototype.updateTimer = function(timer, update) {
    if (update > 0 || this[timer] > Pomodoro.TIMER_UPDATE_SCALE) {
        this[timer] += update * Pomodoro.TIMER_UPDATE_SCALE;
    }
    if (this.state === Pomodoro.STATE_START) {
        this.setTimeLeft(this.workTimer);
    }
};

Pomodoro.prototype.toggleTimerState = function() {
    if (this.state === Pomodoro.STATE_PAUSE || this.state === Pomodoro.STATE_START) {
        this.startTimer();
        this.setState(Pomodoro.STATE_COUNTDOWN);
    } else {
        clearInterval(this.timerID);
        this.setState(Pomodoro.STATE_PAUSE);
    }
};

Pomodoro.prototype.startTimer = function() {
    this.setState(Pomodoro.STATE_COUNTDOWN);
    this.timerID = setInterval(this.tick.bind(this), Pomodoro.TIMER_DELAY);
};

Pomodoro.prototype.tick = function() {
    if (this.timeLeft === 0) {
        this.switchPhase();
    } else {
        this.setTimeLeft(this.timeLeft - (Pomodoro.TIMER_DELAY / 1000));
    }
};

Pomodoro.prototype.switchPhase = function() {
    if (this.phase === Pomodoro.PHASE_WORK) {
        this.setPhase(Pomodoro.PHASE_REST);
        this.setTimeLeft(this.restTimer);
    } else {
        this.setPhase(Pomodoro.PHASE_WORK);
        this.setTimeLeft(this.workTimer);
    }
};

Pomodoro.prototype.on = function(eventName, callback) {
    this.callbacks[eventName] = callback;
};

Pomodoro.prototype.trigger = function(eventName, value) {
    if (this.callbacks[eventName]) {
        this.callbacks[eventName](value);
    }
};

Pomodoro.prototype.setTimeLeft = function(timeLeft) {
    this.timeLeft = timeLeft;
    this.trigger('timeLeftChange');
};

Pomodoro.prototype.setState = function(state) {
    this.state = state;
    this.trigger('stateChange');
};

Pomodoro.prototype.setPhase = function(phase) {
    this.phase = phase;
    this.trigger('phaseChange');
};