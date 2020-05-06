import React, { useState, useEffect } from 'react';

const ASUpdate = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ type, setType ] = useState("update");
    const [ asn, setAsn ] = useState("");
    const [ acsAddr, setAcsAddr ] = useState("");
    const [ effectTime, setEffectTime ] = useState("");

    console.log(accounts[0]);

    function handleTypeChange(event) {
        setType(event.target.value);
    }
    
    function handleAsnChange(event) {
        setAsn(event.target.value);
    }

    function handleAcsAddrChange(event) {
        setAcsAddr(event.target.value);
    }

    function handleEffectTimeChange(event) {
        setEffectTime(event.target.value);
    }

    const handleSubmit = async (event) => {
        console.log(type);
        console.log(asn);
        console.log(acsAddr);
        console.log(effectTime);

        const tx = await contract.methods.ASUpdate(
            type, 
            asn, 
            acsAddr, 
            effectTime
            ).send({ 
                from: accounts[0]
            });

        alert('Successfully submit update!');
        event.preventDefault();
    }

    return (
        <div>
            <h2>Update AS Information</h2>
            <form>
                <select value={type} onChange={handleTypeChange}>
                    <option value="update">update</option>
                    <option value="delete">delete</option>
                </select>
                <br/>
                <label>AS号：<input type="text" value={asn} onChange={handleAsnChange}></input></label>
                <br/>
                <label>ACS地址：<input type="text" value={acsAddr} onChange={handleAcsAddrChange}></input></label>
                <br/>
                <label>生效时间：<input type="text" value={effectTime} onChange={handleEffectTimeChange}></input></label>
                <br/>
                <input type="submit" value="提交" onClick={handleSubmit} />
            </form>
        </div>
    );
}

export default ASUpdate;