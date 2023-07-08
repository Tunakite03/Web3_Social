import * as React from 'react';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Box, Tabs, Tab, Typography } from "@mui/material"
import PropTypes from 'prop-types';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import dayjs from "dayjs";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Fragment, useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { db } from "../connectFB/firebase";
import { WalletContext } from "../context/WalletContextProvider";
// import { Elusiv, SEED_MESSAGE } from '@elusiv/sdk'
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, web3 } from '@project-serum/anchor';
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <>

            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        </>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function HistoryTransfer() {
    // const [elusiv, setElusiv] = useState(null);
    const { publicKey } = useContext(WalletContext);
    const [historyTransfers, setHistoryTransfers] = useState([]);
    const [historyTransfersElusiv, setHistoryTransfersElusiv] = useState([]);
    const solanaWeb3 = require('@solana/web3.js')
    // const publicKey = "GoPvJxanVc99DyXeFVWgpeTfQG5DrBRVYVyKb784UUGM"
    const [value, setValue] = React.useState(0);
    const { signMessage } = useWallet();
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const connection = new solanaWeb3.Connection("https://api-devnet.helius-rpc.com/?api-key=98873fa8-f02e-42e3-a8a2-bedf42201607");
    const fetchHistoryTransfer = async () => {
        await fetch("https://api-devnet.helius.xyz/v0/addresses/" + publicKey + "/transactions?api-key=98873fa8-f02e-42e3-a8a2-bedf42201607")
            .then(response => {
                return response.json()
            })
            .then(async datas => {


                const array = [];
                for (let data of datas) {
                    if (data.type == "TRANSFER" && data.nativeTransfers[0].fromUserAccount != publicKey) {

                        const usersRef = collection(db, "users");
                        const q = query(
                            usersRef,
                            where("publicKey", "==", data.nativeTransfers[0].fromUserAccount)
                        );

                        const querySnapshot = await getDocs(q);
                        // console.log(querySnapshot.docs[0]._document.data.value.mapValue.fields);
                        // console.log(querySnapshot.docs[0]._document.data.value.mapValue.fields.displayName.stringValue)
                        // console.log(querySnapshot.size);
                        if (querySnapshot.docs) {
                            if (querySnapshot.size < 1) {
                                const customInfo = {
                                    'name': data.nativeTransfers[0].fromUserAccount,
                                    'photoURL': '',
                                    'fromUserAccount': data.nativeTransfers[0].fromUserAccount,
                                    'toUserAccount': data.nativeTransfers[0].toUserAccount,
                                    'amount': data.nativeTransfers[0].amount,
                                    'timestamp': data.timestamp,
                                }
                                array.push(customInfo)

                            } else {
                                const customInfo = {
                                    'name': querySnapshot.docs[0]._document.data.value.mapValue.fields.displayName.stringValue,
                                    'photoURL': querySnapshot.docs[0]._document.data.value.mapValue.fields.photoURL.stringValue,
                                    'fromUserAccount': data.nativeTransfers[0].fromUserAccount,
                                    'toUserAccount': data.nativeTransfers[0].toUserAccount,
                                    'amount': data.nativeTransfers[0].amount,
                                    'timestamp': data.timestamp,
                                }
                                array.push(customInfo)
                            }
                        }


                    };
                }
                setHistoryTransfers(array)



            })

    }
    (async () => {

        connection.onAccountChange(

            new solanaWeb3.PublicKey(publicKey),
            (updatedAccountInfo, context) => {
                fetchHistoryTransfer();
                console.log("Updated account info: ", updatedAccountInfo),
                    "confirmed"
            }
        );
    })();
    const connectElusiv = async () => {
        const connectionElusiv = new solanaWeb3.Connection(web3.clusterApiUrl("devnet"), 'confirmed');

        const encodedMessage = new TextEncoder().encode(SEED_MESSAGE)

        const seed = await signMessage(encodedMessage)
        const elusivInstance = await Elusiv.getElusivInstance(seed, publicKey, connectionElusiv, 'devnet')
        setElusiv(elusivInstance)
    }
    useEffect(() => {


        fetchHistoryTransfer();

    }, [])
    const fetchHistoryTransferElusiv = async () => {
        await fetch("https://api-devnet.helius.xyz/v0/addresses/" + publicKey + "/transactions?api-key=98873fa8-f02e-42e3-a8a2-bedf42201607")
            .then(response => {
                return response.json()
            })
            .then(async datas => {

                console.log(datas)
                const array = [];
                for (let data of datas) {
                    if (data.type == "UNKNOWN" && data.feePayer == "DKd9AdVt2ai1rZ37Y64rSvqEz1bubdPHhhYMccKruzfv") {
                        array.push(data)
                    }
                }
                setHistoryTransfersElusiv(array)
            })

    }
    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Public" {...a11yProps(0)} onClick={fetchHistoryTransfer} />
                        <Tab label="Privite" {...a11yProps(1)} onClick={fetchHistoryTransferElusiv} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>

                        {historyTransfers.map((historyTransfer) => (

                            <ListItem alignItems="flex-start" key={crypto.randomUUID().toString()}>
                                <ListItemAvatar>
                                    <Avatar alt="Remy Sharp" src={historyTransfer.photoURL} />
                                </ListItemAvatar>
                                {historyTransfer.fromUserAccount == publicKey ?
                                    <ListItemText
                                        primary={"Bạn"}
                                        secondary={
                                            <Fragment>
                                                {"Đã chuyển " + historyTransfer.amount / LAMPORTS_PER_SOL + " SOL cho "}
                                                {historyTransfer.toUserAccount}
                                                <br />
                                                {dayjs(new Date(historyTransfer.timestamp * 1000)).fromNow()}
                                            </Fragment>
                                        }
                                    />
                                    :
                                    <ListItemText
                                        primary={historyTransfer.name}
                                        secondary={
                                            <Fragment>
                                                {"Đã chuyển cho bạn " + historyTransfer.amount / LAMPORTS_PER_SOL + " SOL"}
                                                <br />
                                                {dayjs(new Date(historyTransfer.timestamp * 1000)).fromNow()}
                                            </Fragment>
                                        }
                                    />}

                            </ListItem>

                        ))
                        }

                    </List >
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1} >

                    <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>

                        {historyTransfersElusiv.map((historyTransfer) => (

                            <ListItem alignItems="flex-start" key={crypto.randomUUID().toString()}>
                                <ListItemAvatar>
                                    <Avatar alt="Remy Sharp" src={historyTransfer.photoURL} />
                                </ListItemAvatar>
                                {historyTransfer.nativeTransfers?.length > 0 ?
                                    <ListItemText
                                        primary={"You"}
                                        secondary={
                                            <Fragment>
                                                {"transfered " + historyTransfer.nativeTransfers[3].amount / LAMPORTS_PER_SOL + " SOL to Elusiv"}
                                                {historyTransfer.toUserAccount}
                                                <br />
                                                {dayjs(new Date(historyTransfer.timestamp * 1000)).fromNow()}
                                            </Fragment>
                                        }
                                    />
                                    :
                                    <ListItemText
                                        primary={"You"}
                                        secondary={
                                            <Fragment>
                                                {"made a secret transaction with Elusiv"}
                                                <br />
                                                {dayjs(new Date(historyTransfer.timestamp * 1000)).fromNow()}
                                            </Fragment>
                                        }
                                    />}

                            </ListItem>

                        ))
                        }

                    </List >
                </CustomTabPanel>
            </Box>
        </>
    )
}
export default HistoryTransfer