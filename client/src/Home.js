import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import ASCard from './ASCard.js';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));


const Home = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract; 

    const [ases, setAses] = useState([]);

    const classes = useStyles();

    const init = async () => {
        try {
            const ases = await contract.methods.asQuery().call();
            console.log(ases);
            setAses(ases);
        } catch (error) {
            alert("Call contract asQuery failed!");
            console.log(error);
        }
    };
    
    useEffect(() => {
        init();
    }, [])

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    const displayAses = () => {
        return ases.map((asInfo) => {
            return (<ASCard
                eth = {props.eth}
                asInfo = {asInfo}
                key = {asInfo}
            />
            );
        });
    };

    return (
        <div className="main-container">
            {displayAses()}
        </div>
    );
}

export default Home;