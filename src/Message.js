import React, {Component} from 'react';
import './App.css';

import TronWeb from 'tronweb';

const contracts = require('./config/contracts');

class Message extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tip: ""
        };

        const TRXMessages = contracts["TRXMessages.sol:TRXMessages"];
        this.contract = window.tronWeb.contract(TRXMessages.abi, TRXMessages.address);
    }

    onChange(event) {
        this.setState({tip: parseFloat(event.target.value)});
    }

    async onTip() {
        if (this.state.tip > 0) {
            const result = await this.contract.methods.tipMessage(this.props.id).send({callValue: this.state.tip * 1000000});
        }
    }

    getTips(message) {
        if (message.tippers > 0) {
            return (
                <div
                    className="col-lg-6 message-tips">{message.tippers} people
                    tipped {message.tips} TRX
                </div>
            );
        } else {
            return (
                <div className="col-lg-6 message-tips">No tips yet</div>
            );
        }
    }

    render() {
        const message = this.props.message;
        const id = this.props.id;
        if (message.status === 'LOADING') {
            return (
                <div key={id}>
                </div>
            );
        } else if (message.status === 'LOADED') {
            return (
                <div key={id} className="row message">
                    <div className="col-lg-12 message-message">{message.message}</div>
                    <div className="col-lg-12 message-poster">By <span
                        className="white">{message.poster}</span> on 2018-10-01 20:24
                    </div>

                    <div className="col-lg-12">
                        <div className="row">
                            {this.getTips(message)}
                            <div className="col-lg-6 message-tips">
                                <div className="row">
                                    <input placeholder="0 TRX" type="number" className="col-lg-6" value={this.state.tip}
                                           onChange={this.onChange.bind(this)}/>
                                    <button onClick={this.onTip.bind(this)} className="col-lg-6 btn btn-sm">TIP NOW
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Message;
