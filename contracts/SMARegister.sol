pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract SMARegister {
    enum UpdateType { Update, Delete }
    struct AddrTimePair {
        string acs_addr;
        uint256 effect_time;
    }
    struct ASUpdateMsg {
        UpdateType update_type;
        uint256 asn;
        string acs_addr;
        uint256 effect_time;
    }
    struct ASInfo {
        uint256 asn;
        AddrTimePair[] acs_list;
    }
    struct ASNAddr{
        uint256 asn;
        string acs_addr;
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this."
        );
        _;
    }

    address public owner;
    ASUpdateMsg[] private app_queue;
    mapping (uint256 => ASInfo) private as_queue;
    uint256[] asn_queue;

    constructor() public {
        owner = msg.sender;
    }

    function ASUpdate(UpdateType _update_type, uint256 _asn, string memory _acs_addr, uint256 _effect_time) public {
        ASUpdateMsg memory as_update_msg = ASUpdateMsg(_update_type, _asn, _acs_addr, _effect_time);
        app_queue.push(as_update_msg);
    }
    function UpdateQuery() public view returns (ASUpdateMsg[] memory apps) {
        return app_queue;
    }
    function UpdateApprove(uint256 asn) public onlyOwner {
        ASUpdateMsg memory as_update_msg = RemoveFromAppQueue(asn);
        ASInfo storage as_info = as_queue[as_update_msg.asn];
        if (as_info.asn == asn) {
            if (as_update_msg.update_type == UpdateType.Delete) {
                as_info.asn = 0;
                RemoveFromASNQueue(asn);
            } else {
                AddrTimePair[] storage acs_list = as_info.acs_list;
                uint n = acs_list.length;
                uint index = n;
                for (uint i = 0; i < n; ++i) {
                    if (acs_list[i].effect_time < as_update_msg.effect_time) {
                        index = i + 1;
                    } else {
                        break;
                    }
                }
                for (uint i = index; i < n; ++i) {
                    acs_list.pop();
                }
                acs_list.push(AddrTimePair(as_update_msg.acs_addr, as_update_msg.effect_time));
            }
        } else {
            if (as_update_msg.update_type == UpdateType.Delete) {
                return;
            }
            as_info.asn = asn;
            as_info.acs_list.push(AddrTimePair(as_update_msg.acs_addr, as_update_msg.effect_time));
            asn_queue.push(asn);
        }
    }
    function UpdateReject(uint256 asn) public onlyOwner {
        RemoveFromAppQueue(asn);
    }
    function QueryAS(uint256 asn, uint256 time) public view returns(string memory) {
        ASInfo storage as_info = as_queue[asn];
        require(as_info.asn != 0, "There is no such AS recorded.");
        uint n = as_info.acs_list.length;
        for (uint i = 0; i < n - 1; ++i) {
            if (as_info.acs_list[i].effect_time <= time && as_info.acs_list[i + 1].effect_time > time) {
                return as_info.acs_list[i].acs_addr;
            }
        }
        return as_info.acs_list[n - 1].acs_addr;
    }
    function QueryAllAS(uint256 time) public view returns(ASNAddr[] memory) {
        ASNAddr[] memory addrs = new ASNAddr[](asn_queue.length);
        for (uint i = 0; i < asn_queue.length; ++i) {
            addrs[i].asn = asn_queue[i];
            ASInfo storage as_info = as_queue[asn_queue[i]];
            require(as_info.asn != 0, "There is no such AS recorded.");
            require(as_info.acs_list[0].effect_time <= time, "The time is prior to the earliest effect time.");
            uint n = as_info.acs_list.length;
            bool found = false;
            for (uint j = 0; j < n - 1; ++j) {
                if (as_info.acs_list[j].effect_time <= time && as_info.acs_list[j + 1].effect_time > time) {
                    addrs[i].acs_addr = as_info.acs_list[j].acs_addr;
                    found = true;
                    break;
                }
            }
            if (!found) {
                addrs[i].acs_addr = as_info.acs_list[n - 1].acs_addr;
            }
        }
        return addrs;
    }


    function RemoveFromAppQueue(uint256 asn) private returns (ASUpdateMsg memory as_update_msg){
        uint n = app_queue.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (app_queue[i].asn == asn) {
                index = i;
                break;
            }
        }
        assert(index < n);
        as_update_msg = app_queue[index];
        for (uint i = index; i < n - 1; ++i) {
            app_queue[i] = app_queue[i + 1];
        }
        app_queue.pop();
    }
    function RemoveFromASNQueue(uint256 asn) private {
        uint n = asn_queue.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (asn_queue[i] == asn) {
                index = i;
                break;
            }
        }
        assert(index < n);
        for (uint i = index; i < n - 1; ++i) {
            asn_queue[i] = asn_queue[i + 1];
        }
        asn_queue.pop();
    }
}