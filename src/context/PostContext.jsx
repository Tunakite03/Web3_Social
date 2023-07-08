import { createContext, useState } from "react";

export const PostContext = createContext();
export const PostContextProvider = ({ children }) => {
  function setTaskListLocal(taskList) {
    localStorage.setItem("taskList", JSON.stringify(taskList));
  }
  function getTaskListLocal() {
    const list = localStorage.getItem("taskList");
    if (list) {
      return JSON.parse(list);
    }
    return [];
  }
  function getTargetListLocal() {
    const list = localStorage.getItem("targetList");
    if (list) {
      return JSON.parse(list);
    }
    return [];
  }
  function setTargetListLocal(targetList) {
    localStorage.setItem("targetList", JSON.stringify(targetList));
  }
  return (
    <PostContext.Provider value={{ getTaskListLocal, setTaskListLocal, getTargetListLocal, setTargetListLocal }}>
      {children}
    </PostContext.Provider>
  );
};
