export class MyNumberControlHTMLElement extends HTMLElement {
    constructor() {
        super(...arguments);
        this._autoCounter = new AutoCounter();
    }
    connectedCallback() {
        const template = document.getElementById(MyNumberControlHTMLElement.nodeName);
        if (!template) {
            throw new Error(`cannot get #${MyNumberControlHTMLElement.nodeName}`);
        }
        this.innerHTML = template.innerHTML;
        // bind to elements
        this._setNumberValueToLabel(this.numberValue);
        this._getIncrementButton().addEventListener('mouseup', this._onCounterMouseUp.bind(this));
        this._getIncrementButton().addEventListener('mousedown', this._onIncrementMouseDown.bind(this));
        this._getDecrementButton().addEventListener('mouseup', this._onCounterMouseUp.bind(this));
        this._getDecrementButton().addEventListener('mousedown', this._onDecrementMouseDown.bind(this));
        this._updateControlButtons();
        // ref: https://getmdl.io/started/index.html#dynamic
        window.componentHandler.upgradeDom();
    }
    disconnectedCallback() {
        this._autoCounter.stopAndGetCount();
    }
    get numberValue() {
        return this._getAttributeInteger('numberValue');
    }
    set numberValue(value) {
        if (this.numberValue === value) {
            return;
        }
        if (!Number.isInteger(value)) {
            throw new Error(`invalid value: ${value}`);
        }
        if (value < this.minValue || this.maxValue < value) {
            throw new Error(`RangeError: ${value}`);
        }
        this.setAttribute('numberValue', value.toString());
        this._setNumberValueToLabel(value);
        this._updateControlButtons();
        const customEventValueChanged = new CustomEvent(MyNumberControlHTMLElement.EventName_ValueChanged, {
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(customEventValueChanged);
    }
    get minValue() {
        return this._getAttributeInteger('minValue');
    }
    get maxValue() {
        return this._getAttributeInteger('maxValue');
    }
    _setNumberValueToLabel(value) {
        const valueLabel = this._getElement('.value-label');
        valueLabel.textContent = value.toString();
    }
    _getElement(selector) {
        const incrementButton = this.querySelector(selector);
        if (!incrementButton) {
            throw new Error(`not found ${selector}`);
        }
        return incrementButton;
    }
    _getIncrementButton() {
        return this._getElement('.control.increment button');
    }
    _getDecrementButton() {
        return this._getElement('.control.decrement button');
    }
    _getAttributeInteger(attributeName) {
        const valueText = this.getAttribute(attributeName);
        if (!valueText || !Number.isInteger(parseInt(valueText))) {
            throw new Error(`invalid ${attributeName}: ${valueText}`);
        }
        return parseInt(valueText);
    }
    _onIncrementMouseDown() {
        this._autoCounter.start({
            startCount: this.numberValue,
            step: 1,
            minValue: this.minValue,
            maxValue: this.maxValue,
            afterCountingUp: (count) => { this._setNumberValueToLabel(count); }
        });
    }
    _onDecrementMouseDown() {
        this._autoCounter.start({
            startCount: this.numberValue,
            step: -1,
            minValue: this.minValue,
            maxValue: this.maxValue,
            afterCountingUp: (count) => { this._setNumberValueToLabel(count); }
        });
    }
    _onCounterMouseUp() {
        this.numberValue = this._autoCounter.stopAndGetCount();
    }
    _updateControlButtons() {
        const canIncrement = (this.numberValue + 1) <= this.maxValue;
        this._getIncrementButton().disabled = !canIncrement;
        const canDecrement = this.minValue <= (this.numberValue - 1);
        this._getDecrementButton().disabled = !canDecrement;
    }
}
MyNumberControlHTMLElement.EventName_ValueChanged = 'valueChanged';
MyNumberControlHTMLElement.nodeName = 'template-my-number-control';
class AutoCounter {
    constructor() {
        this._counterTask = undefined;
        this._count = 0;
        this._counsumedTaskCount = 0;
    }
    start(options) {
        if (this._counterTask) {
            return;
        }
        this._count = options.startCount;
        this._counsumedTaskCount = 0;
        this._countUp(options);
        this._counterTask = setInterval(() => {
            if (this._counsumedTaskCount >= 4) { // fake exponential
                this._countUp(options);
            }
            this._counsumedTaskCount += 1;
        }, 100);
    }
    stopAndGetCount() {
        if (!this._counterTask) {
            return this._count;
        }
        clearInterval(this._counterTask);
        this._counterTask = undefined;
        return this._count;
    }
    _countUp(options) {
        const nextValue = (this._count + options.step);
        if (options.minValue <= nextValue && nextValue <= options.maxValue) {
            this._count = nextValue;
            options.afterCountingUp(nextValue);
        }
    }
}
//# sourceMappingURL=my-number-control-html-element.js.map