import { sketchLeft, sketchRight } from "./canvas.js";
import { Conductor } from "./conductor.js";
import { MyNumberControlHTMLElement } from "./my-number-control-html-element.js";

customElements.define("my-number-control", MyNumberControlHTMLElement);

const playButton = document.getElementById('play-button') ?? throwError('not found #play-button');
playButton.addEventListener('click', onClickPlayButton);

const bpmControl = document.querySelector<MyNumberControlHTMLElement>('#bpm-control') ?? throwError('not found #bpm-control');
bpmControl.addEventListener(MyNumberControlHTMLElement.EventName_ValueChanged, onChangeInputControl);

const divisionRightControl = document.querySelector<MyNumberControlHTMLElement>('#division-right-control') ?? throwError('not found #division-right-control');
const divisionLeftControl = document.querySelector<MyNumberControlHTMLElement>('#division-left-control') ?? throwError('not found #division-left-control');

for(const divisionControl of [divisionLeftControl, divisionRightControl]) {
    divisionControl.addEventListener(MyNumberControlHTMLElement.EventName_ValueChanged, onChangeInputControl);
}

const conductor = new Conductor();

const leftSketch  = new (window as any).p5(sketchLeft, document.getElementById('canvas-left'));
leftSketch.conductor = conductor;
const rightSketch = new (window as any).p5(sketchRight, document.getElementById('canvas-right'));
rightSketch.conductor = conductor;

function onClickPlayButton() {
    if (conductor.isRunning) {
        conductor.stop();
    } else {
        syncInputValueToConductor();
        conductor.start();
    }
    updateStartButtonState(conductor.isRunning);
}

function onChangeInputControl() {
    syncInputValueToConductor();
    conductor.stop();
    conductor.start();
    updateStartButtonState(conductor.isRunning);
}

function updateStartButtonState(isRunning: boolean) {
    const iElement = playButton?.querySelector('i');
    if (!iElement) {
        throw new Error('not found i');
    }
    iElement.innerText = isRunning ? 'pause' : 'play_arrow';
}

function syncInputValueToConductor(): void {
    conductor.changeBpm(bpmControl.numberValue);
    conductor.changeDivision([divisionLeftControl.numberValue, divisionRightControl.numberValue]);
}

function throwError(message: string): never {
    throw new Error(message);
}

