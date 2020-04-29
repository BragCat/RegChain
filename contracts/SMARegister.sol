pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract SMARegister {
    enum UpdateType { Update, Delete }
    struct AddrTimePair {
        string acs_addr;
        uint256 effect_time;
    }
    struct ASUpdateMsg {
        address id;
        UpdateType update_type;
        uint256 asn;
        string acs_addr;
        uint256 effect_time;
    }
    struct ASInfo {
        address id;
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

    string constant NONEXISTENT_ACS_ADDR = "";

    // const used for AS existence check
    address constant UNSET_ID = address(0);
    uint256 constant UNSET_ASN = 0;

    // administrator address of security aliance
    address public owner;
    // AS update application map
    mapping(address => ASUpdateMsg) private app_queue;
    // AS Info map
    mapping(address => ASInfo) private as_queue;
    // id list of current ASes in application map
    address[] app_queue_ids;
    // id list of current ASes in security aliance
    address[] as_queue_ids;

    // binding relations from asn to id, once added, never deleted
    mapping(uint256 => address) asn2id;
    // binding relations from id to asn, once added, never deleted
    mapping(address => uint256) id2asn;

    constructor() public {
        owner = msg.sender;
    }

    function ASUpdate(UpdateType _update_type, uint256 _asn, string memory _acs_addr, uint256 _effect_time) public {
        address id = msg.sender;
        uint256 expected_asn = id2asn[id];
        ASUpdateMsg storage as_update_msg = app_queue[id];
        // check if this address has registered a AS number
        if (expected_asn != UNSET_ASN) {
            require(_asn == expected_asn, "AS number should match!");
        } else {
            require(asn2id[_asn] == UNSET_ID, "AS number should not be registered!");
        }
        // This address has not proposed an application
        if (as_update_msg.id == UNSET_ID) {
            app_queue_ids.push(id);
        }
        as_update_msg.id = id;
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
        // check if the AS is in the security aliance now
        if (as_info.id != UNSET_ID) {
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
            as_info.id = id;
            as_info.asn = as_update_msg.asn;
            as_info.acs_list.push(AddrTimePair(as_update_msg.acs_addr, as_update_msg.effect_time));
            as_queue_ids.push(id);
            asn2id[as_info.asn] = id;
            id2asn[id] = as_info.asn;
        }
    }

    function UpdateReject(address id) public onlyOwner {
        RemoveFromAppQueue(id);
    }

    function SingleACSQuery(uint256 asn, uint256 time) public view returns(string memory) {
        address id = asn2id[asn];
        if (id == UNSET_ID) {
            return NONEXISTENT_ACS_ADDR;
        }
        ASInfo storage as_info = as_queue[id];
        if (as_info.id == UNSET_ID) {
            return NONEXISTENT_ACS_ADDR;
        }
        uint n = as_info.acs_list.length;
        for (uint i = 0; i < n - 1; ++i) {
            if (as_info.acs_list[i].effect_time <= time && as_info.acs_list[i + 1].effect_time > time) {
                return as_info.acs_list[i].acs_addr;
            }
        }
        return as_info.acs_list[n - 1].acs_addr;
    }

    function AllACSQuery(uint256 time) public view returns(ASNAddr[] memory) {
        ASNAddr[] memory addrs = new ASNAddr[](as_queue_ids.length);
        for (uint i = 0; i < as_queue_ids.length; ++i) {
            address id = as_queue_ids[i];
            addrs[i].asn = id2asn[id];
            ASInfo storage as_info = as_queue[id];
            require(as_info.id != UNSET_ID, "The contract state is not consistent!");
            if (as_info.acs_list[0].effect_time > time) {
                addrs[i].acs_addr = NONEXISTENT_ACS_ADDR;
            } else {
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
        }
        return addrs;
    }


    function RemoveFromAppQueue(address id) private returns (ASUpdateMsg memory as_update_msg){
        as_update_msg = app_queue[id];
        require(as_update_msg.id != UNSET_ID, "The update application is invalid!");
        app_queue[id].id = UNSET_ID;
        uint n = app_queue_ids.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (app_queue_ids[i] == id) {
                index = i;
                break;
            }
        }
        require(index < n, "The contract state is not consistent!");
        app_queue_ids[index] = app_queue_ids[n - 1];
        app_queue_ids.pop();
    }

    function RemoveFromASQueue(address id) private {
        require(as_queue[id].id != UNSET_ID, "There is no such AS to be removed!");
        as_queue[id].id = UNSET_ID;
        uint n = as_queue_ids.length;
        uint index = n;
        for (uint i = 0; i < n; ++i) {
            if (as_queue_ids[i] == id) {
                index = i;
                break;
            }
        }
        require(index < n, "The contract state is not consistent!");
        as_queue_ids[index] = as_queue_ids[n - 1];
        as_queue_ids.pop();
    }
}