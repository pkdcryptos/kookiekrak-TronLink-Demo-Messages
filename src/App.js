import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Message from './Message';

import TronWeb from 'tronweb';

const contracts = require('./config/contracts');

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: {},
            topMessages: [],
            latestMessages: [],
            totalMessages: -1,
            lastShown: 0,
            newMessage: "",
            awaitingTronWeb: true
        };


        this.initialize();
        //console.log(await contract.methods.getMessage(0).call());
        //const result = await contract.methods.postMessage(message).send();
        //console.log(result);
    }

    static hextoString(hex) {
        const arr = hex.split("");
        let out = "";

        for (let i = 0; i < arr.length / 2; i++) {
            const tmp = `0x${arr[i * 2]}${arr[i * 2 + 1]}`;
            const charValue = String.fromCharCode(tmp);

            out += charValue;
        }

        return out
    }

    async showBetween(start, end) {
        if (start < 0)
            start = 0;
        console.log(`adding recent between ${start} and ${end}`);
        const latest = this.state.latestMessages;
        for (let i = start; i < end; i++) {
            this.initMessage(i);
            latest.unshift(i);
        }
        console.log(latest);
        this.setState({
            latestMessages: latest
        });
    }

    async initializeTopId(i) {
        const current = await this.contract.methods.topPosts(i).call();
        const id = parseInt(current.id.toString());
        this.initMessage(id);

        const top = this.state.topMessages;
        top[i] = id;
        this.setState({
            topMessages: top
        });
    }

    async initializeTop() {
        for (let i = 0; i < 20; i++) {
            this.initializeTopId(i);
        }
    }

    async initialize(attempts = 0) {
        if (!window.tronWeb || window.tronWeb.ready !== true) {
            console.log('awaiting tronweb...');
            if (attempts > 100)
                return;
            setTimeout(() => {
                this.initialize(attempts++);
            }, 50);
            return;
        } else {
            console.log(`tronweb found!. ready state: ${window.tronWeb.ready}`);
            console.log(window.tronWeb);
        }
        const TRXMessages = contracts["TRXMessages.sol:TRXMessages"];
        this.tronWeb = window.tronWeb;
        this.contract = window.tronWeb.contract(TRXMessages.abi, TRXMessages.address);

        this.initializeTop();
        await this.loadCurrent();
    }

    async loadCurrent() {
        const current = await this.contract.methods.current().call();
        if (current > this.state.totalMessages) {
            await this.showBetween(this.state.totalMessages, current);
            this.setState({
                totalMessages: current
            });
        }
        setTimeout(() => {
            this.loadCurrent();
        }, 1000);
    }

    initMessage(id) {
        if (!this.state.messages[id]) {
            console.log(`loadMessage ${id}`);
            const messages = this.state.messages;
            messages[id] = {
                status: "LOADING",
            };
            this.setState({
                messages: messages
            });
            this.loadMessage(id);
        }
    }

    async loadMessage(id) {
        const message = await this.contract.methods.getMessage(id).call();
        const messages = this.state.messages;

        messages[id] = {
            status: 'LOADED',
            poster: this.tronWeb.address.fromHex(message[0]),
            message: message[1],
            tips: message[2].div(1000000).toString(),
            tippers: message[3].toString()
        };
        this.setState({
            messages
        });
    }

    newMessageChange(event) {
        this.setState({newMessage: event.target.value});
    }

    async submitMessage() {
        if (this.state.newMessage.length > 0) {
            console.log('sending: ' + this.state.newMessage);
            const result = await this.contract.methods.postMessage(this.state.newMessage).send({callValue: 1000000});
            console.log('result');
            console.log(result);
        }
    }

    render() {
        return (
            <div className="container">
                <h1>TRXMessages</h1>

                <div className="row">
                    <div className="col-md-3">

                    </div>
                    <div className="col-md-6 create-message-container">
                        <div>
                            <textarea rows="4" placeholder="Create new message..." className="create-textarea"
                                      value={this.state.newMessage}
                                      onChange={this.newMessageChange.bind(this)}></textarea>
                        </div>
                        <div>
                            <button className="btn btn-sm" onClick={this.submitMessage.bind(this)}>Submit</button>
                        </div>
                        <div className="create-warning">Remember, messages are stored on the TRON blockchain and can
                            never be deleted.
                        </div>
                        <div className="create-warning">Fees: new message 1 TRX, tipping 1%
                        </div>
                    </div>
                    <div className="col-md-3">

                    </div>
                </div>

                <div className="messagesContainer row">
                    <div className="messagesContainerInner messagesRecent col-md-6">
                        <h3>Recent</h3>
                        {
                            this.state.latestMessages.map((i) => {
                                return (
                                    <Message id={i} message={this.state.messages[i]}/>
                                );
                            })
                        }
                    </div>
                    <div className="messagesContainerInner messagesTop col-md-6">
                        <h3>Most Tipped</h3>
                        {
                            this.state.topMessages.map((i) => {
                                return (
                                    <Message id={i} message={this.state.messages[i]}/>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
