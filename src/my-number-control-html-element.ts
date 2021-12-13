export class MyNumberControlHTMLElement extends HTMLElement {
    public static EventName_ValueChanged = 'valueChanged';
    private static nodeName = 'template-my-number-control';
    private _autoCounter: AutoCounter = new AutoCounter();

    connectedCallback(): void {
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
        (window as any).componentHandler.upgradeDom();
    }

    disconnectedCallback() {
        this._autoCounter.stopAndGetCount();
    }
   
    public get numberValue(): number {
        return this._getAttributeInteger('numberValue');
    }

    private set numberValue(value: number) {
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
    
    private get minValue(): number {
        return this._getAttributeInteger('minValue');
    }

    private get maxValue(): number {
        return this._getAttributeInteger('maxValue');
    }

    private _setNumberValueToLabel(value: number): void {
        const valueLabel = this._getElement<HTMLDivElement>('.value-label');
        valueLabel.textContent = value.toString();
    }

    private _getElement<T extends HTMLElement>(selector: string): T {
        const incrementButton = this.querySelector<T>(selector);
        if (!incrementButton) {
            throw new Error(`not found ${selector}`);
        }
        return incrementButton;
    }

    private _getIncrementButton(): HTMLButtonElement {
        return this._getElement<HTMLButtonElement>('.control.increment button');
    }

    private _getDecrementButton(): HTMLButtonElement {
        return this._getElement<HTMLButtonElement>('.control.decrement button');
    }

    private _getAttributeInteger(attributeName: string): number {
        const valueText = this.getAttribute(attributeName);
        if (!valueText || !Number.isInteger(parseInt(valueText))) {
            throw new Error(`invalid ${attributeName}: ${valueText}`);
        }
        return parseInt(valueText);
    }

    private _onIncrementMouseDown(): void {
        this._autoCounter.start({ 
            startCount: this.numberValue,
            step: 1,
            minValue: this.minValue,
            maxValue: this.maxValue,
            afterCountingUp: (count) => { this._setNumberValueToLabel(count); }
        });
    }

    private _onDecrementMouseDown(): void {
        this._autoCounter.start({ 
            startCount: this.numberValue,
            step: -1,
            minValue: this.minValue,
            maxValue: this.maxValue,
            afterCountingUp: (count) => { this._setNumberValueToLabel(count); }
        });
    }

    private _onCounterMouseUp(): void {
        this.numberValue = this._autoCounter.stopAndGetCount();
    }

    private _updateControlButtons(): void {
        const canIncrement = (this.numberValue + 1) <= this.maxValue;
        this._getIncrementButton().disabled = !canIncrement;
        
        const canDecrement = this.minValue <= (this.numberValue - 1);
        this._getDecrementButton().disabled = !canDecrement;
    }
}

type AutoCounterOptions = { 
    startCount: number,
    step: number,
    minValue: number,
    maxValue: number,
    afterCountingUp: (count: number) => void 
}

class AutoCounter {

    private _counterTask?: number = undefined;
    private _count = 0;
    private _counsumedTaskCount = 0;

    start(options: AutoCounterOptions): void {
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

    stopAndGetCount(): number {
        if (!this._counterTask) {
            return this._count;
        }
        clearInterval(this._counterTask);
        this._counterTask = undefined;
        return this._count;
    }

    private _countUp(options: AutoCounterOptions) {
        const nextValue = (this._count + options.step);
        if (options.minValue <= nextValue && nextValue <= options.maxValue) {
            this._count = nextValue
            options.afterCountingUp(nextValue);
        }
    }
}