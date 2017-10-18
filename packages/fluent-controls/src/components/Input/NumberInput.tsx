import * as React from 'react';
import * as classNames from 'classnames/bind';
import {DivProps, ButtonProps, InputProps, Elements as Attr} from '../../Attributes';
import {Icon, IconSize} from '../Icon';
import {TextInput, TextInputAttributes} from './TextInput';
import {MethodNode, keyCode} from '../../Common';
const css = classNames.bind(require('./TextInput.scss'));

export interface NumberInputType {}

const invalidNumber = 'invalid';

export interface NumberInputProps extends React.Props<NumberInputType> {
    /** HTML form element name */
    name: string;
    /** Current value of HTML input element */
    initialValue?: string | number;
    /** HTML input element placeholder */
    placeholder?: string;
    /** Step to give the number input */
    step?: number | 'any';
    /** Minimum value of HTML Input element */
    min?: number;
    /** Maximum value of HTML Input element */
    max?: number;

    /** Node to draw to the left of the input box */
    prefix?: MethodNode;
    /** Node to draw to the right of the input box */
    postfix?: MethodNode;
    
    /** Apply error styling to input element */
    error?: boolean;
    /** Disable HTML input element and apply disabled styling */
    disabled?: boolean;
    /** Autofocus */
    autoFocus?: boolean;

    /** Callback for HTML input element `onChange` events */
    onChange: (newValue: number | 'invalid') => void;

    /** Class to append to top level element */
    className?: string;

    attr?: TextInputAttributes;
}

export interface NumberInputState {
    value: string;
    paste?: boolean;
}

/**
 * Low level text input control
 * 
 * (Use the `TextField` control instead when making a form with standard styling)
 */
export class NumberInput extends React.Component<NumberInputProps, NumberInputState> {
    static defaultProps = {
        name: undefined,
        initialValue: '',
        onChange: undefined,
        integer: false,
        positive: false,
        step: 'any',
        attr: {
            container: {},
            input: {},
            inputContainer: {},
            prefix: {},
            postfix: {},
        }
    };

    private paste: boolean;

    constructor(props: NumberInputProps) {
        super(props);
        
        this.paste = false;
        this.state = this.getInitialState(this.props.initialValue);
    }

    onKeyDown = (event) => {
        /** So that we don't block any browser shortcuts */
        if (event.ctrlKey || event.altKey) {
            return;
        }
        /** These are all keys that don't have characters */
        if (event.keyCode <= keyCode.slash) {
            return;
        }

        if (event.keyCode >= keyCode.num0 && event.keyCode <= keyCode.num9) {
            return;
        }

        if (this.isPositive() && event.keyCode === keyCode.dash) {
            return;
        }
        
        event.preventDefault();
    }

    isPositive(): boolean {
        return typeof(this.props.min) === 'number' && this.props.min >= 0;
    }

    isInteger(): boolean {
        return typeof(this.props.step) === 'number' && this.props.step % 1 === 0;
    }

    onChange = (newValue: string) => {
        if (newValue === '') {
            this.setState({value: '', paste: false});
            return;
        }
        /** Reset our state machine */
        console.log(`entry: ${newValue}`);
        const parsedValue = this.getValue(newValue);
        let paste = this.state.paste;
        console.log(`onInput: ${newValue} - ${parsedValue}`);
        if (parsedValue === invalidNumber) {
            if (this.paste) {
                this.paste = false;
                this.setState({value: newValue, paste: true});
                return;
            } else {
                this.setState({value: newValue});
                return;
            }
        } else {
            if (this.paste) {
                newValue = parsedValue.toString();
                this.paste = false;
            }
            paste = false;
        }

        if (this.isPositive() && parsedValue < 0) {
            return;
        }

        this.setState({value: newValue, paste: paste});
    }

    onPaste = (event) => {
        this.paste = true;
    }

    getInitialState(initialValue: number | string): NumberInputState {
        let value = '';
        if (typeof(initialValue) === 'number') {
            value = initialValue.toString();
        } else {
            if (initialValue) {
                value = initialValue;
            }
        }

        return {
            value: value,
            paste: false
        };
    }

    getValue(value: string): number | 'invalid' {
        if (value === '') {
            return invalidNumber;
        }
        const decimalSeparator = '.';
        const decimalSplit = value.split(decimalSeparator);
        if (this.isInteger() && decimalSplit.length > 1) {
            return invalidNumber;
        }

        value = value.replace(',', '');

        let outValue = this.isInteger() ? parseInt(value) : parseFloat(value);
        if (this.isPositive() && outValue < 0) {
            return invalidNumber;
        }

        if (isNaN(outValue)) {
            return invalidNumber;
        }

        return outValue;
    }

    componentDidUpdate(oldProps: NumberInputProps, oldState: NumberInputState) {
        if (oldState.value === this.state.value) {
            return;
        }

        if (this.state.value === '') {
            this.props.onChange(null);
        } else {
            this.props.onChange(this.getValue(this.state.value));
        }
    }

    componentWillReceiveProps(newProps: NumberInputProps) {
        if (this.props.initialValue !== newProps.initialValue) {
            this.setState(this.getInitialState(newProps.initialValue));
        }
    }

    render() {
        const inputAttr = this.props.attr && this.props.attr.input
            ? this.props.attr.input : {};
        const attr = {
            ...(this.props.attr || {}),
            input: {
                ...inputAttr,
                step: this.props.step,
                min: this.props.min,
                max: this.props.max,
                lang: 'en-150',
                onKeyDown: this.onKeyDown,
                onPaste: this.onPaste,
            }
        };

        return (
            <TextInput
                name={this.props.name}
                value={this.state.value}
                placeholder={this.props.placeholder}
                type='number'
                prefix={this.props.prefix}
                postfix={this.props.postfix}
                error={this.props.error}
                disabled={this.props.disabled}
                autoFocus={this.props.autoFocus}
                onChange={this.onChange}
                attr={attr}
            />
        );
    }
}

export default NumberInput;
