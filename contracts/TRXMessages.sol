pragma solidity ^0.4.22;
contract TRXMessages {
    
    constructor() public{
        owner = msg.sender;
    }
    
    struct Message{
        address creator;
        string message;
        uint tips;
        uint tippers;
    }

    struct Top{
        uint id;
        uint tips;
    }

    uint public current = 0;
    mapping(uint => Message) public messages;

    Top[20] public topPosts;
    address owner;

    function tipMessage(uint id) public payable{
        require(msg.value > 100);

        Message storage m = messages[id];
        
        require(msg.sender != m.creator);
        
        uint fee = msg.value / 100;
        uint tip = msg.value - fee;

        if(m.creator.send(tip) && owner.send(fee)){
            m.tips += msg.value;
            m.tippers += 1;
            
            uint256 i  = 0;
            for(i = 0; i < topPosts.length; i++) {
                if(topPosts[i].tips < m.tips) {
                    break;
                }
            }
            
            for(uint j = topPosts.length - 1; j > i; j--) {
                topPosts[j].tips = topPosts[j - 1].tips;
                topPosts[j].id = topPosts[j - 1].id;
            }

            topPosts[i].tips = m.tips;
            topPosts[i].id = id;
        }
    }

    function postMessage(string message) public payable returns (uint out) {
        require(msg.value == 1000000);
        if(owner.send(1000000)){
            out = current;
            messages[out] = Message({
                creator: msg.sender,
                message: message,
                tips: 0,
                tippers: 0
            });
            current++;
            return out;
        }
    }

    function getMessage(uint id) public view returns (address, string, uint, uint){
        Message memory m = messages[id];
        return (m.creator, m.message, m.tips, m.tippers);
    }

}