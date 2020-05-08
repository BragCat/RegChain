import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import AppCard from './AppCard';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    })
);


const Home = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract; 

    const [apps, setApps] = useState([]);

    const classes = useStyles();

    const init = async () => {
        const updateApps = await contract.methods.UpdateQuery().call();
        setApps(updateApps);
    };
    
    useEffect(() => {
        init();
    }, []);

    const displayUpdateApps = () => {
        return apps.map((app) => {
            return (<AppCard
                eth = {props.eth}
                app = {app}
                key = {app}
            />
            );
        });
    };

    return (
        <div className="main-container">
            {displayUpdateApps()}
        </div>
    );
}

export default Home;