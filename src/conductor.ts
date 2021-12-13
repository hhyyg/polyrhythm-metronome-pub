import { Metronome } from "./metronome.js";

export class Conductor {

    private _audioContext?: AudioContext;
    private _bpm = 60;
    private _metronomes: Metronome[] = [];
    private _metronomeDivisions: number[] = [1, 1];
    private _isRunning = false;
    
    public static MinMaxBpm = { min: 10, max: 300 };
    public static MinMaxDivision = { min: 1, max: 7 };

    start() {
        if (!this._audioContext) {
            this._audioContext = new window.AudioContext();
            this._metronomes = [
                new Metronome('left', this._audioContext, this._bpm, this._metronomeDivisions[0], 600),
                new Metronome('right', this._audioContext, this._bpm, this._metronomeDivisions[1], 800),
            ]
            this._metronomes.forEach((m) => m.start());
            this._isRunning = true;
            console.log(`start. bpm: ${this._bpm}, left: ${this._metronomeDivisions[0]}, right: ${this._metronomeDivisions[1]}`);
        }
    }

    stop() {
        if (this._audioContext) {
            this._metronomes.forEach((m) => m.stop());
            this._metronomes = [];
            // In Safari, it won't work if waiting for it to complete
            // https://gist.github.com/hhyyg/89d5681db9ced05909e0eebb3379455d
            this._audioContext.close(); 
            this._audioContext = undefined;
            this._isRunning = false;
        }
    }

    changeBpm(bpm: number) {
        if (Conductor.MinMaxBpm.min <= bpm && bpm <= Conductor.MinMaxBpm.max) {
            this._bpm = bpm;
        } else {
            throw new Error(`not supported bpm: ${bpm}`);
        }
    }

    changeDivision(divisions: number[]) {
        divisions.forEach(division => {
            if (Conductor.MinMaxDivision.min > division || division > Conductor.MinMaxDivision.max) {
                throw new Error(`not supported division: ${division}`);
            }
        });

        this._metronomeDivisions = divisions;
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    get metronomes(): Metronome[] {
        return this._metronomes;
    }
}