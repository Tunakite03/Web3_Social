export type Todo = {
    id: string,
    title: string, 
    isCompleted: boolean
  }
export type Task = {
    id: string,
    title: string,
    description: string,
    start: string,
    end: string,
    todos: Todo[],
    isCompleted: boolean
  }