import React, {Component} from 'react';
import './App.css';
import Message from './Message';

const contracts = require('./config/contracts');

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: {},
            topMessages: [],
            latestMessages: [],
            newMessage: ""
        };

        this.initialize();
    }

    async initialize(attempts = 0) {
        if (!window.tronWeb || window.tronWeb.ready !== true) {
            console.log('Waiting for tronweb to be injected...');
            return setTimeout(() => {
                this.initialize(attempts++);
            }, 50);
        }

        const TRXMessages = contracts["TRXMessages.sol:TRXMessages"];
        this.contract = window.tronWeb.contract(TRXMessages.abi, TRXMessages.address);

        this.contract.methods.MessageChange().watch((err, event) => {
            if (err)
                return 'failed to bind event listener';
            this.updateMessage(parseInt(event.result.id));
        });

        this.initializeTop();
        await this.loadCurrent();
    }

    /*loads the 20 items from the top list in the contract*/
    async initializeTop() {
        for (let i = 0; i < 20; i++) {
            (async (j) => {
                console.log("LOADING " + j);
                const current = await this.contract.methods.topPosts(j).call();
                console.log(current);
                this.updateMessage(parseInt(current.id.toString()));
            })(i);
        }
    }

    async updateMessage(id) {
        console.log(`updating: ${id}`);
        let messages = this.state.messages;

        /*placeholder while loading*/
        if (!messages[id]) {
            messages[id] = {
                status: "LOADING",
                id
            };
            console.log('initializing ' + id);
            let recent = this.state.latestMessages;
            recent.push(id);
            recent = recent.sort((a, b) => {
                return parseInt(b) - parseInt(a)
            });
            this.setState({
                messages,
                latestMessages: recent
            });
        }

        /*load message information*/
        const message = await this.contract.methods.getMessage(id).call();
        messages = this.state.messages;
        messages[id] = {
            status: 'LOADED',
            poster: window.tronWeb.address.fromHex(message[0]),
            message: message[1],
            tips: message[2].div(1000000).toString(),
            tippers: message[3].toString(),
            time: parseInt(message[4]) * 1000,
            id
        };
        console.log(message);
        console.log(`time ${message[4]}`);

        if (message[2].gt(0) && (this.state.topMessages.length < 20 || (message[2].gt(this.state.topMessages[this.state.topMessages.length - 1])))) {
            //update top posts if this messages is tipped, and either in top20 or better than the worst in the top list
            let topMessages = this.state.topMessages;
            topMessages.push(id);
            topMessages = [...new Set(topMessages)];
            topMessages = topMessages.sort((a, b) => {
                return messages[b].tips - messages[a].tips;
            });
            this.setState({
                messages,
                topMessages
            });
        } else {
            this.setState({
                messages
            });
        }
    }


    async loadCurrent() {
        let current = await this.contract.methods.current().call()
        let start = current < 20 ? 0 : current - 20;
        for (let i = start; i < current; i++) {
            this.updateMessage(i);
        }
    }

    newMessageChange(event) {
        this.setState({newMessage: event.target.value});
    }

    async submitMessage() {
        if (this.state.newMessage.length > 0) {
            const result = await this.contract.methods.postMessage(this.state.newMessage).send({callValue: 1000000});
            console.log(`posted message. txID: ${result}`);
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
