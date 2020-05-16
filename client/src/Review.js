import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import RequestCard from './RequestCard.js';

const useStyles = makeStyles(theme => ({
    button: {
      margin: theme.spacing(1),
    },
    input: {
      display: 'none',
    },
  }));
  

const Review = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ reqs, setReqs ] = useState([]);

    useEffect(() => {
        document.title = "RegChain自治域变更审批";
        init();
    }, []);

    const init = async () => {
        try {
            let ids = await contract.methods.requestIdQuery().call();
            let reqs = [];
            for (let i = 0; i < ids.length; ++i) {
                let res = await contract.methods.requestDetailQuery(ids[i]).call();
                reqs.push({
                    id: ids[i],
                    reqType: res.reqType,
                    asn: res.asn,
                    name: res.name,
                    description: res.description
                });
            } 
            console.log(reqs);
            setReqs(reqs);
        } catch (error) {
            alert("Call contract requestQuery failed!");
            console.log(error);
        }
    };

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    const displayReqs = () => {
        return reqs.map((req) => {
            return (
                <RequestCard 
                    eth={props.eth}
                    request={req}
                    key={req}
                />
            );
        })
    };

    return (
        <div className="main-container">
            {displayReqs()}
        </div>
    );
}

export default Review;