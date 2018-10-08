<<<<<<< HEAD
pragma solidity ^0.4.22;
contract TRXMessages {    
    constructor() public {
        owner = msg.sender;
    }
    
    struct Message {
=======
pragma solidity ^0.4.24;

contract TRXMessages 
{
    struct Message 
    {
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202
        address creator;
        string message;
        uint tips;
        uint tippers;
        uint time;
    }

<<<<<<< HEAD
    struct Top {
        uint id;
        uint tips;
    }
    
    event MessageChange (
       uint id
    );
=======
    event MessagePosted(uint id);
    event MessageTipped(uint id);
    event MessageAddedToTopPosts(uint id);
    event MessageRemovedFromTopPosts(uint id);
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202

    uint public current = 1;
    mapping(uint => Message) public messages;

    uint[20] public topPosts;
    uint public feeToPost;
    uint public minimumTip;
    address public owner;

<<<<<<< HEAD
    function tipMessage(uint id) public payable {
        require(msg.value > 100);
=======
    constructor() public
    {
        owner = msg.sender;
        feeToPost = 1000000;
        minimumTip = 100;
    }
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202

    modifier onlyOwner()
    {
        require(msg.sender == owner);
        _;
    }

    function postMessage(string message) public payable 
    {
        require(msg.value >= feeToPost);
        
        messages[current] = Message(
        {
            creator: msg.sender,
            message: message,
            tips: 0,
            tippers: 0,
            time: now
        });

        uint id = current;
        emit MessagePosted(id);

        current++;

        if(msg.value > feeToPost)
        {
            _tipMessage(id, msg.value - feeToPost);
        }
    }

    function tipMessage(uint _id) public payable
    {
        require(msg.value >= minimumTip);
        _tipMessage(_id, msg.value);
    }

    function _tipMessage(uint _id, uint _amount) internal
    {
        Message storage m = messages[_id];
        
<<<<<<< HEAD
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
=======
        require(m.creator != 0);
        
        uint fee = _amount / 100;
        uint tip = _amount - fee;

        m.creator.transfer(tip);
        m.tips += _amount;
        m.tippers += 1;
        
        bool found = false;
        uint smallestIndex = 0;
        uint smallestValue = ~uint256(0);
        for(uint i = 0; i < topPosts.length; i++)
        {
            if(topPosts[i] == _id)
            {
                smallestIndex = i;
                found = true;
                break;
            }
            if(messages[topPosts[i]].tips < smallestValue && messages[topPosts[i]].tips < m.tips)
            {
                smallestIndex = i;
                smallestValue = messages[topPosts[i]].tips;
                found = true;
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202
            }
        }

<<<<<<< HEAD
            emit MessageChange(id);
=======
        if(found)
        {
            if(topPosts[smallestIndex] != _id)
            {
                if(messages[topPosts[smallestIndex]].creator != 0)
                {
                    emit MessageRemovedFromTopPosts(topPosts[smallestIndex]);
                }
                emit MessageAddedToTopPosts(_id);
            }
            topPosts[smallestIndex] = _id;
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202
        }

        emit MessageTipped(_id);
    }

<<<<<<< HEAD
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
=======
    function updateFeeToPost(uint _feeToPost) onlyOwner public
    {
        feeToPost = _feeToPost;
    }

    function updateMinimumTip(uint _minimumTip) onlyOwner public
    {
        minimumTip = _minimumTip;
    }

    function withdraw() onlyOwner public
    {
        owner.transfer(address(this).balance);
    }

    function changeOwner(address _owner) onlyOwner public
    {
        owner = _owner;
    }
>>>>>>> d2f83f75c18040c5390b1456254ae7f082931202
}