pragma solidity ^0.4.22;
contract TRXMessages {    
    constructor() public {
        owner = msg.sender;
    }
    
    struct Message {
        address creator;
        string message;
        uint tips;
        uint tippers;
        uint time;
    }

    struct Top {
        uint id;
        uint tips;
    }
    
    event MessageChange (
       uint id
    );

    uint public current = 0;
    mapping(uint => Message) public messages;

    Top[20] public topPosts;
    address owner;

    function tipMessage(uint id) public payable {
        require(msg.value > 100);

        Message storage m = messages[id];
        
        require(msg.sender != m.creator);
        
        uint fee = msg.value / 100;
        uint tip = msg.value - fee;

        if(m.creator.send(tip) && owner.send(fee)) {
            m.tips += msg.value;
            m.tippers += 1;
            
            bool found = false;
            uint smallestIndex = 0;
            uint smallestValue = ~uint256(0);

            for(uint i = 0;i<topPosts.length;i++) {
                if(topPosts[i].id == id){
                    smallestIndex = i;
                    found = true;
                    break;
                }

                if(topPosts[i].tips < smallestValue && topPosts[i].tips < m.tips) {
                    smallestIndex = i;
                    smallestValue = topPosts[i].tips;
                    found = true;
                }
            }

            if(found) {
                topPosts[smallestIndex].tips = m.tips;
                topPosts[smallestIndex].id = id;
            }

            emit MessageChange(id);
        }
    }

    function postMessage(string message) public payable {
        require(msg.value == 1000000);
        
        if(owner.send(1000000)) {
            messages[current] = Message({
                creator: msg.sender,
                message: message,
                tips: 0,
                tippers: 0,
                time: now
            });

            emit MessageChange(current);
            current++;
        }
    }

    function getMessage(uint id) public view returns (address, string, uint, uint, uint) {
        Message memory m = messages[id];
        return (m.creator, m.message, m.tips, m.tippers, m.time);
    }
}