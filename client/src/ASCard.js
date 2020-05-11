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

const ASCard = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;

    const [ contract, setContract ] = useState(null);
    const [ asInfo, setAsInfo ] = useState(props.asInfo);
    const [ open, setOpen ] = useState(false);
    const [ isOwner, setIsOwner ] = useState(false);

    const [ asn, setAsn ] = useState(null);
    const [ curAcs, setCurAcs ] = useState(null);
    const [ acs, setAcs ] = useState(null);
    const [ time, setTime ] = useState(null);

    const classes = useStyles();

    useEffect(() => {
        if (asInfo) {
            init(asInfo);
        }
    }, [asInfo]);

    const init = async (asInfo) => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = ASInfoContract.networks[networkId];
            const contract = new web3.eth.Contract(
                ASInfoContract.abi,
                asInfo 
            );
            setContract(contract);

            const asn = await contract.methods.asn().call();
            const curAcsUint = await contract.methods.getCurrentACS().call();
            const curAcs = addressDecoder(curAcsUint);
            setAsn(asn);
            setCurAcs(curAcs);

            const user = accounts[0];
            const owner = await contract.methods.id().call(); 
            if (user == owner) {
                setIsOwner(true);
            }
        } catch (error) {
            alert("Call ASInfo methods failed!");
            console.error(error);
        }
    };

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const addressDecoder = (number) => {
        let ans = "";
        for (let i = 0; i < 32; ++i) {
            const digit = number % 16;
            ans = digit.toString(16) + ans;
            number /= 16;
        }
        return ans;
    }

    const addressEncoder = (s) => {
        let ans = 0n;
        const parts = s.split(":");
        for (let i = 0; i < parts.length; ++i) {
            let hex = parts[i];
            if (hex != "") {
                const part = ("0000" + hex).substr(-4);
                ans = ans * 16 + parseInt(part, 16);
            } else {
                for (let j = parts.length; j < 8; ++j) {
                    ans = ans * Math.pow(16, 4);
                }
            }
        }
        return ans;
    }

    const submitUpdate = async () => {
        try {
            const acsUint = addressEncoder(acs);
            const effectTime = parseInt(time);
            await contract.methods.updateACS(
                acsUint,
                effectTime
            ).send({
                from: accounts[0]
            });
            alert("Update ACS information succeeded!");
        } catch (error) {
            alert("Update ACS information failed!");
            console.error(error);
        }
    };

    return (
        <div className="as-card-container">
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    更新ACS信息
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <div>
                            <p>自治域号：{asn}</p>
                            <p>当前ACS地址：{curAcs}</p>
                        </div>
                        {isOwner && 
                        <div>
                            <FormControl className={classes.formControl}>
                            <TextField 
                                required
                                label="ACS地址"
                                value={acs} 
                                onChange={(e) => {setAcs(e.target.value)}}
                            />
                            <TextField 
                                required
                                label="生效时间" 
                                value={time}
                                onChange={(e) => {setTime(e.target.value)}}
                            />
                            </FormControl>
                            <Button
                                onClick={submitUpdate}  
                                variant="contained"
                                color="primary"
                            >
                                提交
                            </Button>
                        </div>
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="Primary">
                        取消
                    </Button>
                </DialogActions>
            </Dialog>

            <Card className={classes.card} onClick={handleOpen}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {asn}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            <p>{curAcs}</p>
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button
                        onClick={handleOpen}
                        variant="contained"
                        className={classes.button}>
                        View More
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default ASCard;