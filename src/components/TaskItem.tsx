import React from 'react'
import {Task, Todo} from '../types'
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
interface TaskItemProps {
    todo: Todo;
    completeTodo: Function
    selectedTask: Task
  }
  
const TaskItem: React.FC<TaskItemProps> =  ({ todo , completeTodo, selectedTask}) => {
    const [isSuccess, setIsSuccess] = React.useState(todo.isCompleted);
    const handleCompleteTodo = () => {
        setIsSuccess(true);
        completeTodo(selectedTask.id, todo.id);
      };
  return (
    <ListItem
    key={todo.id}
    disableGutters
    secondaryAction={
      <IconButton color={isSuccess ? 'success': 'default'} aria-label="comment" onClick={handleCompleteTodo}>
        <CheckCircleIcon />
      </IconButton>
    }
  >
    <ListItemText primary={`${todo.title}`} />
  </ListItem>
  )
}

export default TaskItem