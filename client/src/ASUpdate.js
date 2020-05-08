import React, { useState, useEffect } from 'react';

const ASUpdate = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ type, setType ] = useState("0");
    const [ asn, setAsn ] = useState("");
    const [ acsAddr, setAcsAddr ] = useState("");
    const [ effectTime, setEffectTime ] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try{
            const typeValue = parseInt(type);       
            const asnValue = parseInt(asn);
            const acsAddrValue = acsAddr;
            const effectTimeValue = parseInt(effectTime);
            console.log(typeValue);
            console.log(asnValue);
            console.log(acsAddrValue);
            console.log(effectTimeValue);
            console.log(accounts[0]);
            const tx = await contract.methods.ASUpdate(
                typeValue, 
                asnValue, 
                acsAddrValue, 
                effectTimeValue
                ).send({ 
                    from: accounts[0]
                });
                /*
            alert('Successfully submit update!');
            */
        } catch (error) {
            console.error(error);
        } 
    }

    return (
        <div>
            <h2>Update AS Information</h2>
            <form>
                <select value={type} onChange={(e) => {setType(e.target.value)}}>
                    <option value="0">update</option>
                    <option value="1">delete</option>
                </select>
                <br/>
                <label>AS号：<input type="text" value={asn} onChange={(e) => {setAsn(e.target.value)}}></input></label>
                <br/>
                <label>ACS地址：<input type="text" value={acsAddr} onChange={(e) => {setAcsAddr(e.target.value)}}></input></label>
                <br/>
                <label>生效时间：<input type="text" value={effectTime} onChange={(e) => {setEffectTime(e.target.value)}}></input></label>
                <br/>
                <input type="submit" value="提交" onClick={handleSubmit} />
            </form>
        </div>
    );
}

export default ASUpdate;