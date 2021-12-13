
const BEATS_PER_SECOND = 60;

export class Metronome {
    constructor(
        private readonly _name: string,
        private readonly _audioContext: AudioContext,
        private readonly _bpm: number,
        private readonly _division: number,
        private readonly _frequency: number,
    ) {
        if (!Number.isInteger(_division)) {
            throw new Error(`division should be Integer: ${_division}`);
        }

        if (!Number.isInteger(_bpm)) {
            throw new Error(`bpm should be Integer ${_bpm}`);
        }
    }

    private readonly _scheduleAheadTimeSec: number = 0.1;
    private readonly _scheduleIntarvalMilliSec: number = 25;
    private _nextTickIndex = 0;
    private _nextTickTimeToSchedule = 0; // standard: audioContext.currentTime
    private _intervalTask?: number;

    get division(): number {
        return this._division;
    }

    start(): void {
        if (!this._intervalTask) {
            this._intervalTask = setInterval(() => {
                this._scheduleTicks();
            }, this._scheduleIntarvalMilliSec);
        }
    }

    stop(): void {
        if (this._intervalTask) {
            clearInterval(this._intervalTask);
            this._intervalTask = undefined;
        }
        this._nextTickIndex = 0;
        this._nextTickTimeToSchedule = 0;
    }

    // return 0 ~ 1
    getNowPositionXAtOneBpm(): number {
        const now = this._audioContext.currentTime;
        const oneBpmSecounds = BEATS_PER_SECOND / this._bpm;
        const bpmUnit = now / oneBpmSecounds;
        const bpmUnitDecimalPart = bpmUnit - Math.floor(bpmUnit);
        return bpmUnitDecimalPart;
    }

    private _scheduleTicks(): void {
        const scheduleAheadTime = this._audioContext.currentTime + this._scheduleAheadTimeSec;

        while (this._nextTickTimeToSchedule < scheduleAheadTime) {
            Metronome._scheduleTick(
                this._audioContext,
                this._nextTickTimeToSchedule,
                this._frequency);

            this.moveNextTickTimeToSchedule();
        }
    }

    private moveNextTickTimeToSchedule(): void {
        const prevTick = this._nextTickTimeToSchedule;

        const nextIsBeat = (this._nextTickIndex % this._division === 0);
        if (nextIsBeat) {
            // To synchronize with multiple metronomes, adjust the timing for each beat.
            const nextBeatIndexInteger = (this._nextTickIndex / this._division);
            this._nextTickTimeToSchedule = BEATS_PER_SECOND / this._bpm * nextBeatIndexInteger;
        } else {
            this._nextTickTimeToSchedule = this._nextTickTimeToSchedule + (BEATS_PER_SECOND / this._division / this._bpm);
        }
        this._nextTickIndex += 1;

        this._log({ nextTickTimeToSchedule: this._nextTickTimeToSchedule, diff: this._nextTickTimeToSchedule - prevTick });
    }

    private _log(message: object): void {
        console.debug({ name: this._name, ...message, });
    }

    private static _scheduleTick(
        audioContext: AudioContext,
        atTimeSec: number,
        frequency: number): void {

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

