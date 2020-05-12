pragma solidity >=0.4.21 <0.7.0;

contract ASInfo {
    struct AcsTime {
        string acs;
        uint256 time;
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this."
        );
        _;
    }

    address public owner;
    bytes20 public id;
    uint256 public asn;
    AcsTime[] private _acses;

    constructor(
        address _owner,
        bytes20 _id,
        uint256 _asn
    )
        public
    {
        owner = _owner;
        id = _id;
        asn = _asn;
    }

    function getCurrentACS(uint256 time) public view returns(string memory) {
        if (_acses.length == 0 || time < _acses[0].time) {
            return "";
        }
        for (uint256 i = 1; i < _acses.length; ++i) {
            if (_acses[i - 1].time <= time && _acses[i].time > time) {
                return _acses[i - 1].acs;
            }
        }
        return _acses[_acses.length - 1].acs;
    }

    function updateACS(string memory acs, uint256 time) public onlyOwner {
        uint256 index = _acses.length;
        while (_acses[index].time >= time) {
            --index;
        }
        while (_acses.length > index + 1) {
            _acses.pop();
        }
        _acses.push(AcsTime(acs, time));
    }
}
