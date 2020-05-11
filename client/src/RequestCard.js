import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';

import ASInfoContract from "./contracts/ASInfo.json";
import Web3 from 'web3';

import { Link } from 'react-router-dom';

const getModalStyle = () => {
    const top = 50;
    const left = 50;
  
    return {
        top,
        left,
    };
};

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(1),
        display: 'table-cell'
    },
    card: {
        maxWidth: 450,
        height: 400
    },
    media: {
        height: 140,
    },
    paper: {
        position: 'absolute',
        width: 500,
        backgroundColor: theme.palette.background.paper,
        border: 'none',
        boxShadow: 'none',
        padding: 4,
    },
}));

const RequestCard = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;
    const id = props.request.id;
    const typeValue = props.request.reqType == 0 ? "注册" : "删除";
    const asn = props.request.asn;

    const classes = useStyles();

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    const submitApprove = async () => {
        try {
            await contract.methods.requestApprove(
                id
            ).send({
                from: accounts[0]
            });
            alert("AS request approved!");
        } catch (error) {
            alert("Approve AS request failed!");
            console.error(error);
        }
        window.location.reload();
    };

    const submitReject = async () => {
        try {
            await contract.methods.requestReject(
                id
            ).send({
                from: accounts[0]
            });
            alert("AS request rejected!");
        } catch (error) {
            alert("Reject AS request failed!");
            console.error(error);
        }
        window.location.reload();
    }

    return (
        <div className="as-card-container">
            <Card className={classes.card}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            <p>申请类型：{ typeValue }</p>{asn}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            <p>自治域号：{ asn }</p>
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button
                        onClick={submitApprove}
                        variant="contained"
                        className={classes.button}
                    >
                        通过
                    </Button>
                    <Button
                        onClick={submitReject}
                        variant="contained"
                        className={classes.button}
                    >
                        拒绝
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default RequestCard;