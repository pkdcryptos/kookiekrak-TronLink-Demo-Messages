pragma solidity ^0.4.24;

contract TRXMessages 
{
    struct Message 
    {
        address creator;
        string message;
        uint tips;
        uint tippers;
        uint time;
    }

    event MessagePosted(uint id);
    event MessageTipped(uint id);
    event MessageAddedToTopPosts(uint id);
    event MessageRemovedFromTopPosts(uint id);

    uint public current = 0;
    mapping(uint => Message) public messages;

    uint[20] public topPosts;
    uint public feeToPost;
    uint public minimumTip;
    address owner;

    constructor() public
    {
        owner = msg.sender;
        feeToPost = 1000000;
        minimumTip = 100;
    }

    modifier onlyOwner()
    {
        require(msg.sender == owner);
        _;
    }

    function postMessage(string message) public payable 
    {
        require(msg.value == feeToPost);
        
        messages[current] = Message(
        {
            creator: msg.sender,
            message: message,
            tips: 0,
            tippers: 0,
            time: now
        });

        emit MessagePosted(current);

        current++;
    }

    function tipMessage(uint _id) public payable
    {
        require(msg.value >= minimumTip);

        Message storage m = messages[_id];
        
        require(msg.sender != m.creator);
        require(m.creator != 0);
        
        uint fee = msg.value / 100;
        uint tip = msg.value - fee;

        m.creator.transfer(tip);
        m.tips += msg.value;
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
            }
        }

        if(found)
        {
            if(messages[topPosts[smallestIndex]].creator != 0)
            {
                emit MessageRemovedFromTopPosts(_id);
            }
            if(topPosts[smallestIndex] != _id)
            {
                emit MessageAddedToTopPosts(_id);
            }
            topPosts[smallestIndex] = _id;
        }

        emit MessageTipped(_id);
    }

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
}