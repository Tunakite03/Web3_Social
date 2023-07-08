import styled from "@emotion/styled";
import { EmojiEmotions, Image } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  List,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// import TodoList from "../components/TodoList";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";
import { useContext } from "react";
import { PostContext } from "../context/PostContext";
import PageNotFound from "./PageNotFound";

import idl from "../idl.json";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../connectFB/firebase";
import { AuthContext } from "../context/AuthContext";
const UserBox = styled(Box)({
  display: "flex",
  gap: 10,
  marginBottom: 10,
  alignItems: "center",
});

function Tasks() {
  const {currentUser} = useContext(AuthContext)
  const wallet = useAnchorWallet();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const [provider, setProvider] = useState(
    new AnchorProvider(connection, wallet, "confirmed")
  );
  const programID = new PublicKey(idl.metadata.address);
  const [program, setProgram] = useState(new Program(idl, programID, provider));
  const { targetId } = useParams();
  const { getTaskListLocal, setTaskListLocal, getTargetListLocal } =
    useContext(PostContext);
  const [hasMedia, setHasMedia] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  // const [currentEditedId, setCurrentEditedId] = useState("");
  const [tasks, setTasks] = useState(getTaskListLocal);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [infoTasks, setInfoTasks] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const initialTarget = { title: "" };
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [targets, setTargets] = useState(getTargetListLocal);
  useEffect(() => {
    setIsLoading(true);
    fetchGoal();
    setIsLoading(false);
    fitler();
  }, []);
  const fitler = async () => {
    setIsLoadingTask(true);
    try {
      const usersRef = collection(db, "tasks");
      const q = query(usersRef, where("goalId", "==", targetId));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      if (querySnapshot.docs) {
        setFilteredTasks(querySnapshot.docs);
      }

      setIsLoadingTask(false);
      console.log(querySnapshot);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchGoal = async () => {
    let currentTarget = await program.account.goal.fetch(targetId);
    // console.log("currentTarget", currentTarget);
    if (!currentTarget) {
      return <PageNotFound />;
    }
    setCurrentTarget(currentTarget);
  };

  const initialTask = {
    id: "",
    title: "",
    content: "",
    startDate: "",
    endDate: "",
    members: "",
    money: "",
    status: false,
  };
  const [task, setTask] = useState(initialTask);
  const [target, setTarget] = useState(initialTarget);

  const [openModal, setOpenModal] = useState(false);
  const hanldeOpenModal = (task) => {
    setOpenModal(true);
    setSelectedTask(task);
  };
  const hanldeCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };
  const handleTaskMedia = () => {
    setHasMedia((prevState) => !prevState);
    let newTask = { ...task, media: "" };
    setTask(newTask);
  };
  const selectTask = (task) => {
    setTask(initialTask);
    setSelectedTask(task);
    setTask(task);
    setHasMedia(task.media ? true : false);
  };
  const handleClearTask = () => {
    setSelectedTask(null);
    setTask(initialTask);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (selectedTask === null) {
      if (
        task.title &&
        task.content &&
        task.startDate &&
        task.endDate
        // task.todos.length > 0
      ) {
        let newTask = { ...task, id: crypto.randomUUID().toString() };
        let newTasks = [...tasks, newTask];
        console.log(currentTarget);
        console.log(currentTarget.createdPerson);
        const d = {
          goalId: targetId,
          createdPerson: currentTarget.createdPerson.toString(),
          ...task,
        };
        await setDoc(doc(db, "tasks", crypto.randomUUID().toString()), d);
        setTasks(newTasks);
        // setTaskListLocal(newTasks);
        setTask(initialTask);
        fitler();
      }
    } else {
      let newTasks = tasks.map((t) => {
        if (t.id === selectedTask.id) {
          t = task;
        }
        return t;
      });
      setSelectedTask(null);
      setTasks(newTasks);
      setTaskListLocal(newTasks);
      setTask(initialTask);
      setTodos([]);
    }
  };
  const completeTodo = (taskId, todoId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedTodos = task.todos.map((todo) => {
          if (todo.id === todoId) {
            let isCompleted = !todo.isCompleted;
            return { ...todo, isCompleted: isCompleted };
          }
          return todo;
        });
        return { ...task, todos: updatedTodos };
      }
      return task;
    });
    setTasks(updatedTasks);
    setTaskListLocal(updatedTasks);
  };
  return (
    <>
      {isLoading ? (
        <p></p>
      ) : (
        <div style={{ padding: 20 }}>
          <Link to={"/targets"}>
            {" "}
            <Button variant="contained">Back to targets</Button>
          </Link>

          <Stack direction={"row"} gap={3}>
            <Box flex={2} paddingTop={2}>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <UserBox flex={3}>
                  <Avatar
                    id="demo-positioned-button"
                    sx={{ width: 30, height: 30 }}
                    src="https://images.pexels.com/photos/762527/pexels-photo-762527.jpeg?auto=compress&cs=tinysrgb&w=600"
                  />
                  <Typography variant="span">{currentUser?.displayName}</Typography>
                </UserBox>
                <Box flex={1}>
                  <Select
                    style={{ paddingLeft: 2 }}
                    defaultValue="0"
                    fullWidth
                    variant="standard"
                    placeholder="Type"
                    value={task.type}
                    onChange={(e) => {
                      setTask((prev) => {
                        return { ...prev, type: e.target.value };
                      });
                    }}
                  >
                    <MenuItem value="0" selected>
                      Public
                    </MenuItem>
                    <MenuItem value="1">Private</MenuItem>
                  </Select>
                </Box>
              </Stack>
              <TextField
                style={{ marginTop: 20 }}
                fullWidth
                value={currentTarget?.name}
                readOnly
                placeholder="Enter title"
                variant="standard"
              />
              <TextField
                style={{ marginTop: 20 }}
                fullWidth
                value={task.title}
                onChange={(e) => {
                  setTask((prev) => {
                    return { ...prev, title: e.target.value };
                  });
                }}
                placeholder="Enter title"
                variant="standard"
              />
              <TextField
                style={{ marginTop: 20 }}
                fullWidth
                value={task.content}
                onChange={(e) => {
                  setTask((prev) => {
                    return { ...prev, content: e.target.value };
                  });
                }}
                multiline
                placeholder="Enter content"
                variant="standard"
              />
              <TextField
                style={{ marginTop: 20 }}
                fullWidth
                variant="standard"
                type="date"
                value={task.startDate}
                onChange={(e) => {
                  setTask((prev) => {
                    return { ...prev, startDate: e.target.value };
                  });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                style={{ marginTop: 20 }}
                fullWidth
                variant="standard"
                type="date"
                value={task.endDate}
                onChange={(e) => {
                  setTask((prev) => {
                    return { ...prev, endDate: e.target.value };
                  });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Stack direction={"row"} gap={1} mt={1}>
                <EmojiEmotions color="primary" />
                <Image color="secondary" onClick={handleTaskMedia} />
              </Stack>
              <ButtonGroup
                sx={{ mt: 4, width: "100%" }}
                variant="contained"
                aria-label="outlined primary button group"
              >
                <Button sx={{ width: "100%" }} onClick={handleSaveTask}>
                  Save task
                </Button>
                <Button sx={{ width: "100%" }} onClick={handleClearTask}>
                  clear task
                </Button>
              </ButtonGroup>
            </Box>
            <Box flex={3}>
              <Typography variant="h4">Task list</Typography>
              <>
                  {filteredTasks.length > 0 ? (
                    <>
                      <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tiêu đề</TableCell>
                              {/* <TableCell align="right">Mô tả</TableCell> */}
                              <TableCell align="center">Bắt đầu</TableCell>
                              <TableCell align="center">Kết thúc</TableCell>
                              <TableCell align="center">Tình trạng</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {console.log(filteredTasks)}
                            {filteredTasks.map((row) => (
                              <TableRow
                                key={
                                  row._document.data.value.mapValue.fields.id
                                }
                                sx={{
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell
                                  component="th"
                                  scope="row._document.data.value.mapValue.fields"
                                >
                                  {
                                    row._document.data.value.mapValue.fields
                                      .title.stringValue
                                  }
                                </TableCell>
                                <TableCell align="center">
                                  {dayjs(
                                    row._document.data.value.mapValue.fields
                                      .startDate.stringValue,
                                    "YYYY-MM-DD"
                                  ).format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell align="center">
                                  {dayjs(
                                    row._document.data.value.mapValue.fields
                                      .endDate.stringValue,
                                    "YYYY-MM-DD"
                                  ).format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell align="center">
                                  {"Chưa hoàn thành"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {openModal && selectedTask !== null && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={hanldeCloseModal}
                        >
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            style={{
                              backgroundColor: "#fff",
                              width: 400,
                              padding: "20px",
                              borderRadius: 5,
                            }}
                          >
                            <List
                              sx={{
                                width: "100%",
                                maxWidth: 360,
                                bgcolor: "background.paper",
                              }}
                            >
                              <Typography variant="h6">
                                Todo list of this task
                              </Typography>
                              <TodoList
                                todos={selectedTask.todos}
                                typeAction={"complete"}
                                parrentId={selectedTask.id}
                                functionAction={completeTodo}
                              />
                            </List>
                            <Button
                              type="button"
                              variant="contained"
                              color="error"
                              onClick={hanldeCloseModal}
                            >
                              Close
                            </Button>
                          </Box>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>You have no task</p>
                  )}
                </>
            </Box>
          </Stack>
        </div>
      )}
    </>
  );
}

export default Tasks;
