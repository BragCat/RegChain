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
        init();
    }, []);

    const init = async () => {
        try {
            let res = await contract.methods.requestQuery().call();
            const ids = res.ids;
            const reqTypes = res.reqTypes;
            const asns = res.asns;
            let reqs = [];
            for (let i = 0; i < ids.length; ++i) {
                reqs.push({id: ids[i], reqType: reqTypes[i], asn: asns[i]});
            } 
            console.log(reqs);
            setReqs(reqs);
        } catch (error) {
            alert("Call contract requestQuery failed!");
            console.log(error);
        }
    };

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