import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Clock
} from "lucide-react";

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2
};

export default function App() {

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("student-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdding, setIsAdding] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium"
  });

  useEffect(() => {
    localStorage.setItem("student-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }

      return new Date(a.dueDate || "").getTime() -
             new Date(b.dueDate || "").getTime();
    });
  }, [tasks]);

  const getDateStatus = (date) => {
    if (!date) return "";

    const today = new Date().setHours(0,0,0,0);
    const due = new Date(date).setHours(0,0,0,0);

    if (due < today) return "Overdue";
    if (due === today) return "Due Today";
    return "Upcoming";
  };

  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    const task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      completed: false,
      subTasks: [],
      createdAt: Date.now()
    };

    setTasks([task, ...tasks]);

    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "medium"
    });

    setIsAdding(false);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const generateSubTasks = (task) => {

    const suggestions = [
      "Research topic",
      "Create outline",
      "Start working",
      "Review work",
      "Finalize submission"
    ];

    const newSubTasks = suggestions.slice(0,3).map(text => ({
      id: crypto.randomUUID(),
      title: text,
      completed: false
    }));

    setTasks(tasks.map(t =>
      t.id === task.id
        ? { ...t, subTasks: [...t.subTasks, ...newSubTasks] }
        : t
    ));
  };

  const toggleSubTask = (taskId, subTaskId) => {

    setTasks(tasks.map(task => {

      if (task.id === taskId) {

        return {
          ...task,
          subTasks: task.subTasks.map(st =>
            st.id === subTaskId
              ? { ...st, completed: !st.completed }
              : st
          )
        };

      }

      return task;
    }));
  };

  return (

    <div className="container">

      <h1 className="title">Student Task Planner</h1>

      <button onClick={() => setIsAdding(true)}>
        <Plus size={16}/> New Task
      </button>

      {isAdding && (

        <form onSubmit={addTask} className="glass" style={{marginTop:20}}>

          <label>Task Title</label>
          <input
            placeholder="Example: Finish ML assignment"
            value={newTask.title}
            onChange={(e)=>setNewTask({...newTask,title:e.target.value})}
          />

          <label>Description</label>
          <textarea
            placeholder="Optional task description"
            value={newTask.description}
            onChange={(e)=>setNewTask({...newTask,description:e.target.value})}
          />

          <label>Due Date</label>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e)=>setNewTask({...newTask,dueDate:e.target.value})}
          />

          <label>Priority</label>
          <select
            value={newTask.priority}
            onChange={(e)=>setNewTask({...newTask,priority:e.target.value})}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <button style={{marginTop:10}}>Add Task</button>

        </form>

      )}

      <div style={{marginTop:30}}>

        {sortedTasks.map(task => (

          <div key={task.id} className="task-card">

            <div style={{display:"flex",justifyContent:"space-between"}}>

              <div>

                <span className={task.completed ? "completed" : ""}>
                  {task.title}
                </span>

                <div className={`priority ${task.priority}`} style={{marginTop:6}}>
                  {task.priority} priority
                </div>

              </div>

              <button onClick={()=>deleteTask(task.id)}>
                <Trash2 size={16}/>
              </button>

            </div>

            <div style={{fontSize:13,marginTop:8}}>

              {task.dueDate && (
                <span>
                  <Clock size={14}/>
                  {" "}
                  {new Date(task.dueDate).toLocaleDateString()}
                  {" "}
                  ({getDateStatus(task.dueDate)})
                </span>
              )}

              <button
                style={{marginLeft:12}}
                onClick={()=>generateSubTasks(task)}
              >
                <Sparkles size={14}/> Generate subtasks
              </button>

            </div>

            {task.subTasks.map(sub => (

              <div key={sub.id} className="subtask">

                <button onClick={()=>toggleSubTask(task.id,sub.id)}>
                  {sub.completed
                    ? <CheckCircle2 size={16}/>
                    : <Circle size={16}/>
                  }
                </button>

                <span className={sub.completed ? "completed" : ""}>
                  {sub.title}
                </span>

              </div>

            ))}

          </div>

        ))}

      </div>

    </div>
  );
}