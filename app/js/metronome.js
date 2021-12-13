const BEATS_PER_SECOND = 60;
export class Metronome {
    constructor(_name, _audioContext, _bpm, _division, _frequency) {
        this._name = _name;
        this._audioContext = _audioContext;
        this._bpm = _bpm;
        this._division = _division;
        this._frequency = _frequency;
        this._scheduleAheadTimeSec = 0.1;
        this._scheduleIntarvalMilliSec = 25;
        this._nextTickIndex = 0;
        this._nextTickTimeToSchedule = 0; // standard: audioContext.currentTime
        if (!Number.isInteger(_division)) {
            throw new Error(`division should be Integer: ${_division}`);
        }
        if (!Number.isInteger(_bpm)) {
            throw new Error(`bpm should be Integer ${_bpm}`);
        }
    }
    get division() {
        return this._division;
    }
    start() {
        if (!this._intervalTask) {
            this._intervalTask = setInterval(() => {
                this._scheduleTicks();
            }, this._scheduleIntarvalMilliSec);
        }
    }
    stop() {
        if (this._intervalTask) {
            clearInterval(this._intervalTask);
            this._intervalTask = undefined;
        }
        this._nextTickIndex = 0;
        this._nextTickTimeToSchedule = 0;
    }
    // return 0 ~ 1
    getNowPositionXAtOneBpm() {
        const now = this._audioContext.currentTime;
        const oneBpmSecounds = BEATS_PER_SECOND / this._bpm;
        const bpmUnit = now / oneBpmSecounds;
        const bpmUnitDecimalPart = bpmUnit - Math.floor(bpmUnit);
        return bpmUnitDecimalPart;
    }
    _scheduleTicks() {
        const scheduleAheadTime = this._audioContext.currentTime + this._scheduleAheadTimeSec;
        while (this._nextTickTimeToSchedule < scheduleAheadTime) {
            Metronome._scheduleTick(this._audioContext, this._nextTickTimeToSchedule, this._frequency);
            this.moveNextTickTimeToSchedule();
        }
    }
    moveNextTickTimeToSchedule() {
        const prevTick = this._nextTickTimeToSchedule;
        const nextIsBeat = (this._nextTickIndex % this._division === 0);
        if (nextIsBeat) {
            // To synchronize with multiple metronomes, adjust the timing for each beat.
            const nextBeatIndexInteger = (this._nextTickIndex / this._division);
            this._nextTickTimeToSchedule = BEATS_PER_SECOND / this._bpm * nextBeatIndexInteger;
        }
        else {
            this._nextTickTimeToSchedule = this._nextTickTimeToSchedule + (BEATS_PER_SECOND / this._division / this._bpm);
        }
        this._nextTickIndex += 1;
        this._log({ nextTickTimeToSchedule: this._nextTickTimeToSchedule, diff: this._nextTickTimeToSchedule - prevTick });
    }
    _log(message) {
        console.debug({ name: this._name, ...message, });
    }
    static _scheduleTick(audioContext, atTimeSec, frequency) {
        const osc = audioContext.createOscillator();
        osc.frequency.value = frequency;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1;
        gainNode.gain.exponentialRampToValueAtTime(1, atTimeSec + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, atTimeSec + 0.17);
        gainNode.connect(audioContext.destination);
        osc.connect(gainNode);
        osc.start(atTimeSec);
        osc.stop(atTimeSec + 0.3);
    }
}
//# sourceMappingURL=metronome.js.map