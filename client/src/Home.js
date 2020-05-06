import React from 'react';

const Home = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract; 

    return (
        <div><h2>AS Update Requests:</h2></div>
    );
}

export default Home;