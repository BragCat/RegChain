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
    mapping(address => ASUpdateMsg) private app_queue;
    mapping(address => ASInfo) private as_queue;
    address[] app_queue_ids;
    address[] as_queue_ids;
    mapping(uint256 => address) asn2id;

    constructor() public {
        owner = msg.sender;
    }

    function ASUpdate(UpdateType _update_type, uint256 _asn, string memory _acs_addr, uint256 _effect_time) public {
        require(_asn != 0, "AS number should not be 0!");
        ASInfo storage as_info = as_queue[msg.sender];
        ASUpdateMsg storage as_update_msg = app_queue[msg.sender];
        // This address has registered a AS number
        if (as_info.asn != 0) {
            require(_asn == as_info.asn, "AS number should match!");
        }
        // This address has not propose an application
        if (as_update_msg.asn == 0) {
            app_queue_ids.push(msg.sender);
        }
        as_update_msg.update_type = _update_type;
        as_update_msg.asn = _asn;
        as_update_msg.acs_addr = _acs_addr;
        as_update_msg.effect_time = _effect_time;
    }

    function UpdateQuery() public view returns (ASUpdateMsg[] memory apps) {
        apps = new ASUpdateMsg[](app_queue_ids.length);
        for (uint i = 0; i < app_queue_ids.length; ++i) {
            apps[i] = app_queue[app_queue_ids[i]];
        }
        return apps;
    }

    function UpdateApprove(address id) public onlyOwner {
        ASUpdateMsg memory as_update_msg = RemoveFromAppQueue(id);
        ASInfo storage as_info = as_queue[id];
        if (as_info.asn != 0) {
            if (as_update_msg.update_type == UpdateType.Delete) {
                RemoveFromASQueue(id);
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
            as_info.asn = as_update_msg.asn;
            as_info.acs_list.push(AddrTimePair(as_update_msg.acs_addr, as_update_msg.effect_time));
            as_queue_ids.push(id);
            asn2id[as_info.asn] = id;
        }
    }

    function UpdateReject(address id) public onlyOwner {
        RemoveFromAppQueue(id);
    }

    function QueryAS(uint256 asn, uint256 time) public view returns(string memory) {
        address id = asn2id[asn];
        if (id == address(0)) {
            return "";
        }
        ASInfo storage as_info = as_queue[id];
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
        ASNAddr[] memory addrs = new ASNAddr[](as_queue_ids.length);
        for (uint i = 0; i < as_queue_ids.length; ++i) {
            address id = as_queue_ids[i];
            ASInfo storage as_info = as_queue[id];
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


    function RemoveFromAppQueue(address id) private returns (ASUpdateMsg memory as_update_msg){
        as_update_msg = app_queue[id];
        if (app_queue[id].asn == 0) {
            return as_update_msg;
        }
        app_queue[id].asn = 0;
        uint n = app_queue_ids.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (app_queue_ids[i] == id) {
                index = i;
                break;
            }
        }
        if (index == n) {
            return as_update_msg;
        }
        for (uint i = index; i < n - 1; ++i) {
            app_queue_ids[i] = app_queue_ids[i + 1];
        }
        app_queue_ids.pop();
    }

    function RemoveFromASQueue(address id) private {
        uint256 asn = as_queue[id].asn;
        if (asn == 0) {
            return;
        }
        asn2id[asn] = address(0);
        as_queue[id].asn = 0;
        uint n = as_queue_ids.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (as_queue_ids[i] == id) {
                index = i;
                break;
            }
        }
        if (index == n) {
            return;
        }
        for (uint i = index; i < n - 1; ++i) {
            as_queue_ids[i] = as_queue_ids[i + 1];
        }
        as_queue_ids.pop();
    }
}