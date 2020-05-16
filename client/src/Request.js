import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(2),
    },
  }));

const Request = (props) => {
    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ type, setType ] = useState("");
    const [ asn, setAsn ] = useState("");
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");

    useEffect(() => {
        document.title = "RegChain自治域变更";
    }, []);

    const handleSubmit = async (event) => {
        try{
            const typeValue = parseInt(type);       
            const asnValue = parseInt(asn);
            console.log(typeValue);
            console.log(asnValue);
            console.log(accounts[0]);
            console.log(contract);
            const tx = await contract.methods.createASRequest(
                typeValue, 
                asnValue, 
                name, 
                description
            ).send({ 
                from: accounts[0]
            });
            alert('Successfully submit!');
            window.location.reload();
        } catch (error) {
            console.error(error);
        } 
    }

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    return (
        <div className="main-container">
            <h2>自治域变更请求</h2>
            <div>
            <FormControl required className={classes.FormControl}>
            <InputLabel>变更类型</InputLabel>
            <Select 
                required 
                value={type} 
                onChange={(e) => {setType(e.target.value)}}
            >
                <MenuItem value="0">注册</MenuItem>
                <MenuItem value="1">删除</MenuItem>
            </Select>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="自治域号"
                value={asn} 
                onChange={(e) => {setAsn(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="自治域名"
                value={name} 
                onChange={(e) => {setName(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="描述"
                value={description} 
                onChange={(e) => {setDescription(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <Button 
                className={classes.button}
                onClick={handleSubmit} 
                variant="contained"
                color="primary"
            >
                提交
            </Button>
        </div>
    );
}

export default Request;