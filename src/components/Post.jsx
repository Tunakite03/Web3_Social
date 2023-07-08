import styled from "@emotion/styled";
import {
  CheckCircle,
  Delete,
  Expand,
  ExpandMoreRounded,
  Favorite,
  Folder,
  MoreVert,
  Share,
} from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));
function Post({ post }) {
  const calculateProgress = (todos) => {
    const sumWithInitial = todos.reduce((count, todo) => {
      if (todo.isCompleted) {
        return count + 1;
      }
      return count;
    }, 0);
    // console.log((sumWithInitial / todos.length) * 100);
    return (sumWithInitial / todos.length) * 100;
  };
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <Card style={{ margin: "10px 0", padding: "8px" }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "#1976d2" }} aria-label="recipe">
            T
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVert />
          </IconButton>
        }
        title="Author 's name"
        subheader=""
      />
      {post.media !== "" && (
        <CardMedia
          component="img"
          image={post.media}
          alt="Paella dish"
        />
      )}
      <CardContent>
        <Typography variant="h2" color="text.secondary">
          {post.title}
        </Typography>
        <Typography variant="p" color="text.secondary">
          {post.content}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <Favorite />
        </IconButton>
        <IconButton aria-label="share">
          <Share />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreRounded />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Todo list:</Typography>
          <List dense={false}>
            {post.todos.map((todo) => (
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    {todo.isCompleted && <CheckCircle color={'success'}/>}
                  </IconButton>
                }
              >
                <ListItemText primary={todo.title} />
              </ListItem>
            ))}
          </List>
          <Typography paragraph>
            Progress bar:{" "}
            <LinearProgress
              variant="determinate"
              value={calculateProgress(post.todos) || 0}
            />
          </Typography>
          <Typography paragraph>
            Start time:{" "}
            {dayjs(post.startDate, "YYYY-MM-DD").format("DD/MM/YYYY")}
          </Typography>
          <Typography paragraph>
            End time: {dayjs(post.endDate, "YYYY-MM-DD").format("DD/MM/YYYY")}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default Post;
