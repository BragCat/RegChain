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
import FormLabel from '@material-ui/core/FormLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';

import ASInfoContract from "./contracts/ASInfo.json";
import Web3 from 'web3';

import { Link } from 'react-router-dom';

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
        width: 400,
        height: 170,
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
    const [ name, setName ] = useState(null);
    const [ description, setDescription ] = useState(null);
    const [ curAcs, setCurAcs ] = useState(null);
    const [ acs, setAcs ] = useState("");
    const [ time, setTime ] = useState("1970-01-01T00:00");

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
            const name = await contract.methods.name().call();
            const description = await contract.methods.description().call();
            const curAcs = await contract.methods.getCurrentACS(Math.round(Date.now() / 1000)).call();
            setAsn(asn);
            setName(name);
            setDescription(description);
            setCurAcs(curAcs);

            const user = accounts[0].toLowerCase();
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
        window.location.reload();
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const submitUpdate = async () => {
        try {
            const t = new Date(time);
            const effectTime = t.getTime() / 1000;
            console.log(acs);
            console.log(time);
            console.log(effectTime);
            await contract.methods.updateACS(
                acs,
                effectTime
            ).send({
                from: accounts[0]
            });
            alert("Update ACS information succeeded!");
            setOpen(false);
            window.location.reload();
        } catch (error) {
            alert("Update ACS information failed!");
            console.error(error);
        }
    };

    return (
        <div className="as-card-container">
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    更新ACS信息
                </DialogTitle>
                <DialogContent>
                    <p>自治域号：{asn}</p>
                    <p>当前ACS地址：{curAcs}</p>
                    <p>自治域名：{name}</p>
                    <p>描述：{description}</p>
                    {isOwner && 
                    <div>
                        <FormControl className={classes.formControl}>
                        <TextField 
                            required
                            label="ACS地址"
                            value={acs} 
                            onChange={(e) => {setAcs(e.target.value)}}
                        />
                        </FormControl>
                        <FormControl>
                        <TextField 
                            required
                            label="生效时间"
                            value={time}
                            type="datetime-local"
                            onChange={(e) => {setTime(e.target.value)}}
                        />
                        </FormControl>
                    </div>
                    }
                </DialogContent>
                <DialogActions>
                    {isOwner &&
                    <Button onClick={submitUpdate} color="primary">
                        提交
                    </Button>
                    }
                    <Button onClick={handleClose} color="primary">
                        取消
                    </Button>
                </DialogActions>
            </Dialog>

            <Card className={classes.card} onClick={handleOpen}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            自治域号：{asn}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="div">
                            自治域名：{name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="div">
                            当前ACS地址：{curAcs}
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