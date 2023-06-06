import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import { Group } from "../../types";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '4px'
};

function setGroupLocal(group: Group | null){
  localStorage.setItem("group", JSON.stringify(group))
}

function getGroupLocal(){
  const group = localStorage.getItem("group");
  if (group) {
    return JSON.parse(group);
  }
  return {};
}

function CreateGroup() {
  const [group, setGroup] = useState<Group | null>(getGroupLocal);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [groupName, setGroupName] = useState('')

  const createGroup = async () => {
    const value = {
      id: "abc1",
      name: groupName
    }
    setGroup(value);
    setGroupLocal(value);
    handleClose();
    console.log(groupName);
    console.log(group);
    console.log(getGroupLocal());
  };

  const deleteGroup = async () => {
    setGroup(null);
    setGroupLocal(null)
    console.log(group);
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="flex-end"
    >
      <Button onClick={handleOpen}>Create Group</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Create new group
          </Typography>
          <Box
            component="form"
            sx={{ m: 1 }}
            autoComplete="on"
          >
            <Input sx={{ display: 'block' }} placeholder="Please enter a group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </Box>
          <Button variant="contained" type="submit" onClick={createGroup}>Submit</Button>
        </Box>
      </Modal>

      <Button onClick={deleteGroup}>Delete Group</Button>
    </Grid>
  );
}

export default CreateGroup;
