import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../connectFB/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";

import { InputBase, Stack } from "@mui/material";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletContext } from "../context/WalletContextProvider";
import { Elusiv, SEED_MESSAGE, TopupTxData } from "@elusiv/sdk";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const Input = () => {
  const [tranferType, setTranferType] = useState(1);
  const [elusiv, setElusiv] = useState(null);
  const publicKey = useContext(WalletContext);
  const { data } = useContext(ChatContext);
  const [numberSol, setNumberSol] = useState(0);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [qty, setQty] = useState(0);
  const wallet = useAnchorWallet();
  const connection = new Connection(web3.clusterApiUrl("devnet"), "processed");
  const { currentUser } = useContext(AuthContext);
  const { signMessage, signTransaction } = useWallet();

  const connectElusiv = async () => {
    const encodedMessage = new TextEncoder().encode(SEED_MESSAGE);
    const seed = await signMessage(encodedMessage);
    const connectionConfirm = new Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );

    const elusivInstance = await Elusiv.getElusivInstance(
      seed,
      wallet.publicKey,
      connectionConfirm,
      "devnet"
    );
    setElusiv(elusivInstance);
    alert("connectedElusiv");
  };

  const getBalanceElusiv2 = async () => {
    const privateBalance = await elusiv.getLatestPrivateBalance("LAMPORTS");
    // const privateBalance = await elusiv.getPrivateTransactions(2, "LAMPORTS");
    // console.log(privateBalance)
    setBalance(privateBalance);
    setFetching(false);
  };

  const topup = async (elusivInstance, amount, tokenType) => {
    // Build our topup transaction
    const topupTx = await elusivInstance.buildTopUpTx(amount, tokenType);
    // Sign it (only needed for topups, as we're topping up from our public key there)
    console.log("a");
    const signature = await signTransaction(topupTx.tx);
    console.log("b");
    const rebuildTopup = new TopupTxData(
      topupTx.getTotalFee(),
      "LAMPORTS",
      topupTx.lastNonce,
      topupTx.commitmentHash,
      topupTx.merkleStartIndex,
      topupTx.wardenInfo,
      signature,
      topupTx.hashAccIndex,
      topupTx.merge
    );

    // Send it off
    return elusivInstance.sendElusivTx(rebuildTopup);
  };

  const topupHandler = async (e) => {
    e.preventDefault();
    // toast.info("Initiating topup...");
    const sig = await topup(elusiv, 100000000, "LAMPORTS");
    // toast.success(`Topup complete with sig ${sig.signature}`);
  };

  const handlerTransferSolPrivate = () => {
    transferSolPrivate(elusiv, numberSol * LAMPORTS_PER_SOL, "LAMPORTS");
  };

  const transferSolPrivate = async (elusivInstance, amount, tokenType) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", data.user.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      const toPublicKey =
        querySnapshot.docs[0]._document.data.value.mapValue.fields.publicKey
          .stringValue;

      const sendTx = await elusivInstance.buildSendTx(
        amount,
        new PublicKey(toPublicKey),
        tokenType
      );
      console.log("sending");
      // Build the send transaction
      // Send it off!
      return elusivInstance.sendElusivTx(sendTx);

    } else {
      alert("Khong tim thay dia chi nguoi dung");
    }
  };

  const transferSol = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", data.user.uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      const toPublicKey =
        querySnapshot.docs[0]._document.data.value.mapValue.fields.publicKey
          .stringValue;

      sendSOL(connection, wallet, toPublicKey, numberSol);
    } else {
      alert("Khong tim thay dia chi nguoi dung");
    }
  };

  async function sendSOL(connection, payer, toPubkey, numberSol) {
    // if account balance < 0.15 SOL then stop
    const balance = await connection.getBalance(
      new web3.PublicKey(payer.publicKey)
    );
    if (balance / web3.LAMPORTS_PER_SOL < numberSol + 0.0001) {
      alert("Balance is not enough");
      return;
    }
    const transaction = new web3.Transaction();

    // send 0.1 SOL to the RECEIVER_PUBLIC_KEY
    const instruction = web3.SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toPubkey,
      lamports: numberSol * web3.LAMPORTS_PER_SOL,
    });
    transaction.add(instruction);

    // Setting the variables for the transaction
    transaction.feePayer = await payer.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Transaction constructor initialized successfully
    if (transaction) {
      console.log("Txn created successfully");
    }

    // Request creator to sign the transaction (allow the transaction)
    let signed = await payer.signTransaction(transaction);
    // The signature is generated
    let signature = await connection.sendRawTransaction(signed.serialize());
    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
    setOpen(false);
    alert("transfer success");
    //Signature chhap diya idhar
    console.log("Signature: ", signature);
  }
  const handleSend = async () => {
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "chats", data.chatId), {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: currentUser.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
    setImg(null);
  };
  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <div className="send">
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}
          required
        />

        <label htmlFor="file">
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Button
                variant="contained"
                onClick={() => {
                  setTranferType(1);
                }}
                style={{ marginRight: "6px" }}
              >
                {" "}
                Gửi Tiền pulic
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setTranferType(2);
                }}
              >
                Gửi Tiền private
              </Button>
              {tranferType == 1 ? (
                <>
                  {" "}
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    <InputBase
                      type="number"
                      onChange={(e) => setNumberSol(e.target.value)}
                      placeholder=" Nhập số sol bạn muốn gửi"
                      variant="contained"
                    />
                  </Typography>
                  <Button variant="contained" onClick={transferSol}>
                    Gui tien
                  </Button>
                </>
              ) : (
                <>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    <InputBase
                      type="number"
                      onChange={(e) => setNumberSol(e.target.value)}
                      placeholder=" Nhập số sol gui rieng tu"
                      variant="contained"
                    />
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handlerTransferSolPrivate}
                  >
                    Gui tien
                  </Button>
                  <Button variant="contained" onClick={connectElusiv}>
                    Kết nối Elusiv
                  </Button>
                  <Button variant="contained" onClick={topupHandler}>
                    Nạp tiền
                  </Button>
                </>
              )}
            </Box>
          </Modal>
        </label>
        <div className="btn-container">
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            Chuyen tien
          </button>

          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Input;
