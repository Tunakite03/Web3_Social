import { Stack, Box, TextField, Modal, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import AddBoxIcon from '@mui/icons-material/AddBox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import { DataGrid , GridColDef, GridValueGetterParams,GridCellParams } from '@mui/x-data-grid';
import List from '@mui/material/List';

import moment from 'moment';
import { Todo, Task } from '../types';
import TaskItem from '../components/TaskItem';

const style = {
  position: 'absolute',
  width: '100%',
  height: '100vh',  
  bgcolor: 'background.paper',
  p: 4,
};

function setTaskListLocal(taskList: Array<Task>){
  localStorage.setItem("taskList", JSON.stringify(taskList))
}

function getTaskListLocal(){
  const list = localStorage.getItem("taskList");
  if (list) {
    return JSON.parse(list);
  }
  return [];
}

function Tasks() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const [selectedTask, setSelectedTask] = useState<Task|null>(null)
  const handleOpenModal = (task : Task) => {
    setSelectedTask(task);
  };
  const handleCloseModal = () => {
    setSelectedTask(null);
  };
  const [currentEditedId, setCurrentEditedId] = useState<string>('') 
  const [tasks, setTasks] = useState<Task[]>(getTaskListLocal)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [start, setStart] = useState<string>('')
  const [end, setEnd] = useState<string>('')
  const [todo, setTodo] = useState<Todo>({
    id: '',
    title: '',
    isCompleted: false
  })
  const [todos,setTodos] = useState<Todo[]>([{
    id: 'helloworld',
    title: 'Hello world',
    isCompleted: false
  }])

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>)  => {
    e.preventDefault()
    if(currentEditedId === ''){
      if(title && description && end && start && todos.length > 0){
              // save task
          let newTask = {
      id: crypto.randomUUID().toString(),
      title, description, start,end,
      todos,
      isCompleted: false
      }
    let newTasks = [...tasks,newTask]
    setTasks(newTasks)
    setTaskListLocal(newTasks)
      }
    }else{
      let newTasks = tasks.map((task: Task, index: number) =>{
        if(task.id === currentEditedId){
          task.title = title
          task.description = description
          task.start = start
          task.end = end
          task.todos = todos
        }
        return task
      })
      setTasks(newTasks)
      setTaskListLocal(newTasks)
      setCurrentEditedId('')
      setIsOpen(false)
    }
    // reset fields 
    setTitle('')
    setDescription('')
    setStart('')
    setEnd('')
    setTodos([])
  }
  const handleSaveTodo = (e : React.MouseEvent<HTMLButtonElement>) =>{
   if(todo.title.trim() !== ''){
    setTodos(todos=>[...todos, todo])
    setTodo({
      id: '',
      title: '',
      isCompleted: false
    })
   }
  }
  const handleSetTodoTile = (e : React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.value.trim() !== ''){
      let todo = {
        id: Date.now().toString(),
        title: e.target.value,
        isCompleted: false
      }
      setTodo(todo)
    }
  }
  // delete todo or task
  const deleteItem = (id: string, type = 'task') =>{
    if(type === 'task'){
      let newTasks = tasks.filter(task=> task.id !== id)
      setTasks(newTasks)
      setTaskListLocal(newTasks)
    }else{
      let newTodos = todos.filter(todo=> todo.id !== id)
      setTodos(newTodos)
    }
  }
  const completeTask = (id: string) =>{
    let newTasks = tasks.map((task: Task)=> {
      if(task.id === id){
        task.isCompleted = true
      }
      return task
    })
    setTasks(newTasks)  
    setTaskListLocal(newTasks)
  }
  const completeTodo = (taskId: string, todoId: string) =>{
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedTodos = task.todos.map((todo) => {
          if (todo.id === todoId) {
            return { ...todo, isCompleted: true };
          }
          return todo;
        });
        return { ...task, todos: updatedTodos };
      }
      return task;
    });
    setTasks(updatedTasks)  
    setTaskListLocal(updatedTasks)
  }
  // edit task
  const handleEditTask = (id: string) => {
    setCurrentEditedId(id)
    let currentEditedItem = tasks.find((task: Task )=> task.id === id )
    setTitle(currentEditedItem?.title || '')
    setDescription(currentEditedItem?.description || '')
    setStart(currentEditedItem?.start || '')
    setEnd(currentEditedItem?.end || '')
    setTodos(currentEditedItem?.todos || [])
    setIsOpen(true)
  }
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', width: 130 },
    { field: 'description', headerName: 'Description', width: 130 },
    { field: 'start', headerName: 'Start', width: 130 },
    { field: 'end', headerName: 'End', width: 130 },
    { field: 'status', headerName: 'Status', width: 130,
    valueGetter: (params: GridValueGetterParams) =>
    {
    var specifiedDate = moment(params.row.end);
    var currentDate = moment();
    var daysDiff = specifiedDate.diff(currentDate, 'days');
    if(params.row.isCompleted === true){
      return 'Completed'
    }
    return daysDiff >= 0 ? `${daysDiff} day(s) left` : `Overdue`
    } },
    {field: 'todos', headerName: 'Todos', width: 70, renderCell: (params: GridCellParams) =>(
      <>
      <IconButton aria-label="delete" size="medium" onClick={() => handleOpenModal(params.row)}>
        <VisibilityIcon />
      </IconButton>
  </>
    )},
    {field: 'action', headerName: "Action", width: 300, renderCell: (params: GridCellParams) => (
      <div>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={()=>{completeTask(params.row.id)}}
        >
          Complete
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={()=>{handleEditTask(params.row.id)}}
          style={{margin: '0 10px'}}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={()=>{deleteItem(params.row.id)}}
        >
          Delete
        </Button>
      </div>
    )}
  ];
  return (
    <div>
      <Button onClick={handleOpen} variant='outlined' endIcon={<AddBoxIcon/>} style={{margin: 20}}>Add new task</Button>
      <div style={{ width: 'fit-content', margin: '0 auto' }}>
      {tasks.length > 0 ? <DataGrid
        rows={tasks}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        // checkboxSelection
      /> : <p>You have no task</p>}
    </div>
    <Modal
        open={isOpen}
        onClose={handleClose}
      >
        <Box sx={style}>
          <Typography variant='h5' style={{textAlign: 'center', textTransform: 'uppercase', fontWeight: 600}}>add your task</Typography>
        <Stack direction={'column'}>
          <form onSubmit={handleSubmit}>
          <TextField size='small' type='text' label="Title" variant='outlined' style={{width: '100%', marginBottom: 30}} value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
          <TextField size='small' type='text' label="Description" variant='outlined' multiline  style={{width: '100%', marginBottom: 30}}  value={description} onChange={(e)=>{setDescription(e.target.value)}}/>
          <div>
            <p>Start: </p>
            <TextField size='small' type='date' variant="outlined" style={{width: '100%', marginBottom: 30}}  value={start} onChange={(e)=>{setStart(e.target.value)}}/>
          </div>
          <div>
            <p>End:</p>
            <TextField size='small' type='date' variant="outlined" style={{width: '100%', marginBottom: 30}} value={end} onChange={(e)=>{setEnd(e.target.value)}} />
          </div>
            <div  style={{marginBottom: 30}}>
              <Stack direction={'row'}>
              <Box flex={6}>
              <TextField  size='small' type='text' variant="outlined" label={'Enter todo'}  style={{width: '100%', marginBottom: 30}} value={todo.title} onChange={handleSetTodoTile}/>
              <Button type='button' variant="contained" color='success' onClick={handleSaveTodo} size='small'>save todo</Button>
              </Box>
              <Box flex={6} m={'0 30px'}>
                <Typography variant='h6'>Todo list of this task:</Typography>
                <ul style={{marginBottom: 20}}>
                  {todos.map((todo : Todo ) =>{
                    return <li key={todo.id}>{todo.title} <span style={{cursor: 'pointer'}} onClick={()=> deleteItem(todo.id, 'todo')}>x</span></li>
                  })}
                </ul>
              </Box>
              </Stack>
            </div>
            <Box>
              <Button type='submit' variant="contained" color='success'>Save</Button>
              <Button type='button' variant="contained" style={{marginLeft: 20}} color='error' onClick={handleClose}>Close</Button>
            </Box>
        </form>
      </Stack>
        </Box>
      </Modal>
      {selectedTask && (
        <div onClick={handleCloseModal} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
        <Box onClick={(e)=>{e.stopPropagation()}} style={{backgroundColor: '#fff', width: 400, padding: '20px', borderRadius: 5}}>
     <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant='h6'>Todo list of this task</Typography>
        {selectedTask.todos.map((todo: Todo) => {
          return (
      <TaskItem todo={todo} completeTodo={completeTodo} selectedTask={selectedTask}/>
        )
        })}
      </List>
          <Button type='button' variant="contained" color='error' onClick={handleCloseModal}>Close</Button>
      </Box>
        </div>
      )}
    </div>

  )
}

export default Tasks