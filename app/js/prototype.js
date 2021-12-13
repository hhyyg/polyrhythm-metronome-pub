import { Conductor } from "./conductor.js";
const conductor = new Conductor();
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const bpmInput = document.getElementById('bpm-input');
const leftDivision = document.querySelector('#metronome-left .division-input');
const rightDivision = document.querySelector('#metronome-right .division-input');
const divisions = [leftDivision, rightDivision];
setControls();
function setControls() {
    startButton?.addEventListener('click', onClickStartButton);
    stopButton?.addEventListener('click', onClickStopButton);
    bpmInput?.addEventListener('change', onChangeBpm);
    bpmInput?.setAttribute('min', Conductor.MinMaxBpm.min.toString());
    bpmInput?.setAttribute('max', Conductor.MinMaxBpm.max.toString());
    for (const divisionInput of divisions) {
        if (!divisionInput) {
            throw new Error(`not set divisions: ${divisions}`);
        }
        divisionInput?.setAttribute('min', (1).toString());
        divisionInput?.setAttribute('max', (7).toString());
        divisionInput?.addEventListener('change', onChangeDivision);
    }
}
function onClickStartButton() {
    syncInputValueToConductor();
    conductor.stop();
    conductor.start();
}
function onClickStopButton() {
    conductor.stop();
}
function onChangeBpm(event) {
    if (event.target instanceof HTMLInputElement) {
        syncInputValueToConductor();
        conductor.stop();
        conductor.start();
    }
}
function onChangeDivision() {
    syncInputValueToConductor();
    conductor.stop();
    conductor.start();
}
function syncInputValueToConductor() {
    conductor.changeBpm(parseInt(bpmInput?.value));
    conductor.changeDivision(divisions.map(division => parseInt(division.value)));
}
//# sourceMappingURL=prototype.js.map