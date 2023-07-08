import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import idl from "../idl.json";
import React, { useContext, useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { ExpandMore } from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";
// import { PostContext } from "../context/PostContext";
import PageNotFound from "./PageNotFound";
import { getParams } from "../helper";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";

const UserBox = styled(Box)({
  display: "flex",
  gap: 10,
  marginBottom: 10,
  alignItems: "center",
});
import { WalletContext, useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { PostContext } from "../context/PostContext";
function Targets() {
  // const { getTaskListLocal, getTargetListLocal, setTargetListLocal } = useContext(PostContext)
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [target, setTarget] = useState({ title: "" });
  const { publicKey } = useContext(WalletContext);
  const wallet = useAnchorWallet();

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const [provider, setProvider] = useState(
    new AnchorProvider(connection, wallet, "confirmed")
  );
  const programID = new PublicKey(idl.metadata.address);
  const [program, setProgram] = useState(new Program(idl, programID, provider));

  const initialTarget = { title: "" };
  useEffect(() => {
    getTargets();
  }, []);

  const selectTarget = (t) => {
    console.log(t.publicKey.toString());
    const data = {
      title: t.account.name,
      id: t.publicKey,
    };
    setTarget(initialTarget);
    setSelectedTarget(data);
    setTarget(data);
  };

  const getTargets = async () => {
    const goals = await program.account.goal.all();
    console.log(goals);
    setTargets(goals);
  };

  const getAllTasksOfTarget = async (publicKey) => {
    const tasks = await program.account.goal.fetch(publicKey);
    console.log(tasks);
    // return tasks;
    return [];
  };
  const handleSaveTarget = async () => {
    const goal = Keypair.generate();
    await program.rpc.createGoal(target.title, {
      accounts: {
        goal: goal.publicKey,
        createdPerson: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [goal],  
    });
    getTargets();
  };
  const handleUpdateTarget = async () => {
    console.log('update',target.id);
    if (!wallet?.publicKey) return
    // const goal = Keypair.generate();
    await program.rpc.updateGoal(target.title, 'ok', {
      accounts: {
        goal:target.id,
        createdPerson: provider.wallet.publicKey
      },
      signers: []
    });
    setSelectedTarget(null)
    setTarget(initialTarget)
    getTargets();
  }
  const handleClearTarget = () => {
    setTarget({ title: "" });
  };
  const deleteItem = async (goal) => {
    if (!wallet?.publicKey) return;

    await program.rpc.deleteGoal({
      accounts: {
        goal: goal.publicKey,
        createdPerson: provider.wallet.publicKey,
      },
      signers: [],
    });
    getTargets();
  };
  return (
    <Stack direction={"row"} gap={3}>
      <Box flex={2} padding={5}>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <UserBox flex={3}>
            <Avatar
              id="demo-positioned-button"
              sx={{ width: 30, height: 30 }}
              src="https://images.pexels.com/photos/762527/pexels-photo-762527.jpeg?auto=compress&cs=tinysrgb&w=600"
            />
            <Typography variant="span">John</Typography>
          </UserBox>
        </Stack>
        <TextField
          style={{ marginTop: 20 }}
          fullWidth
          value={target.title}
          onChange={(e) => {
            setTarget((prev) => {
              return { ...prev, title: e.target.value };
            });
          }}
          placeholder="Enter your goal"
          variant="standard"
        />
        {!selectedTarget ? <ButtonGroup
          sx={{ mt: 4, width: "100%" }}
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button sx={{ width: "100%" }} onClick={handleSaveTarget}>
            Save goal
          </Button>
          <Button sx={{ width: "100%" }} onClick={handleClearTarget}>
            clear
          </Button>
        </ButtonGroup>: <ButtonGroup
          sx={{ mt: 4, width: "100%" }}
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button sx={{ width: "100%" }} onClick={handleUpdateTarget}>
            Update goal
          </Button>
          <Button sx={{ width: "100%" }} onClick={handleClearTarget}>
            clear
          </Button>
        </ButtonGroup>}
      </Box>
      <Box flex={3}>
        <Typography variant="h4">Goal list</Typography>
        {targets.length > 0 ? (
          <>
            {targets.map((t) => {
              console.log();
              if (t.account.createdPerson.toString() == publicKey) {
                return (
                  <Accordion key={t.publicKey.toString()}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Stack
                        style={{ width: "100%" }}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Box>
                          <Typography>{t.account.name}</Typography>
                        </Box>

                        <Box>
                          <Link to={`/tasks/${t.publicKey.toString()}`}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => {
                                selectTarget(t);
                              }}
                            >
                              add task
                            </Button>
                          </Link>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                              selectTarget(t);
                            }}
                          >
                            Update
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                              deleteItem(t);
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Stack>
                    </AccordionSummary>
                    {/* <AccordionDetails>
                    {getAllTasksOfTarget(t).map((task) => (
                      <Typography key={task.id}>{task.title}</Typography>
                    ))}
                  </AccordionDetails> */}
                  </Accordion>
                );
              }
            })}
          </>
        ) : (
          <p>Bạn chưa có mục tiêu nào</p>
        )}
      </Box>
    </Stack>
  );
}

export default Targets;
