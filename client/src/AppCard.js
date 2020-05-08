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

import { Link } from 'react-router-dom'

const getModalStyle = () => {
    const top = 50;
    const left = 50;

    return {
        top,
        left,
    };
}

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

const AppCard = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ id, setId ] = useState(null);
    const [ type, setType] = useState(null);
    const [ asn, setAsn ] = useState(null);
    const [ acsAddr, setAcsAddr ] = useState(null);
    const [ effectTime, setEffectTime ] = useState(null);

    const { app } = props.app;

    const classes = useStyles();

    useEffect(() => {
        if (app) {
            init(app);
        }
    }, [app]);

    const init = (app) => {
        setId(app.id);
        setType(app.update_type);
        setAsn(app.asn);
        setAcsAddr(app.acs_addr);
        setEffectTime(app.effect_time);
    };

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });

    const handleApprove = async (event) => {
        await contract.methods.UpdateApprove(id).send({
            from: accounts[0],
        });
        window.location.reload();
    }

    const handleReject = async (event) => {
        await contract.methods.UpdateReject(id).send({
            from: accounts[0],
        });
        window.location.reload();
    }

    return (
        <div className="fundraiser-card-container">
            <Card className={classes.card}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    title={asn.toString() + "AS Update Application"}
                />
                <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                    <p>管理员地址: {id}</p>
                    <p>请求类型: {type == 0 ? "Update" : "Delete"}</p>
                    <p>AS号: {asn}</p>
                    <p>ACS服务器地址: {acsAddr}</p>
                    <p>生效时间: {effectTime}</p>
                </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button onClick={handleApprove} variant="contained" color="primary">
                    通过
                </Button>

                <Button onClick={handleReject} variant="contained" color="primary">
                    拒绝
                </Button>
            </CardActions>
            </Card>
        </div>
    )
}

export default AppCard;
