var pomodoro;

function init() {
    pomodoro = new Pomodoro();
    pomodoro.onTick = renderTimer;
    pomodoro.onSwitch = renderTimerName;

    renderTimerLength('workTimer');
    renderTimerLength('restTimer');
    renderTimerName('Work session');
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

    $('.js-btn-switch').on('click', function() {
        pomodoro.switchTimer();
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

function renderTimerName(currentTimer) {
    $('.js-currentTimer').text(currentTimer);
}

$(document).ready(init);

// Pomodoro

var STATE_COUNTDOWN = 'STATE_COUNTDOWN';
var STATE_PAUSE = 'STATE_PAUSE';
var PHASE_WORK = 'PHASE_WORK';
var PHASE_REST = 'PHASE_REST';
var TIMER_DELAY = 1000;
var TIMER_UPDATE_SCALE = 60;


function Pomodoro() {
    this.state = STATE_PAUSE;
    this.phase = PHASE_WORK;
    this.workTimer = 0.2 * 60;
    this.restTimer = 0.1 * 60;
    this.resetCountdown();
}

Pomodoro.prototype.resetCountdown = function() {
    this.timeLeft = this.workTimer;
};

Pomodoro.prototype.updateTimer = function(timer, update) {
    if (update > 0 || this[timer] > TIMER_UPDATE_SCALE) {
        this[timer] += update * TIMER_UPDATE_SCALE;
    }
};

Pomodoro.prototype.switchTimer = function() {
    if (this.state === STATE_PAUSE) {
        this.startTimer();
        this.state = STATE_COUNTDOWN;
    } else {
        clearInterval(this.timerID);
        this.state = STATE_PAUSE;
    }
};

Pomodoro.prototype.startTimer = function() {
    this.state = STATE_COUNTDOWN;
    this.timerID = setInterval(this.tick.bind(this), TIMER_DELAY);
};

Pomodoro.prototype.tick = function() {
    this.onTick();
    this.timeLeft -= TIMER_DELAY / 1000;
    if (this.timeLeft < 0) {
        clearInterval(this.timerID);
        this.switchPhase();
        this.startTimer();
    }
};

Pomodoro.prototype.switchPhase = function() {
    if (this.phase === PHASE_WORK) {
        this.phase = PHASE_REST;
        this.timeLeft = this.restTimer;
        this.onSwitch('Rest');
    } else {
        this.phase = PHASE_WORK;
        this.timeLeft = this.workTimer;
        this.onSwitch('Work session');
    }
};
