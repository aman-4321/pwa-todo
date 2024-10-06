import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import OfflineMessage from "@/components/OfflineMessage"; // Import the OfflineMessage component

// Task interface to type the tasks in the todo list
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TodoList() {
  // State for task title and description inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // State for storing tasks with initial value from local storage
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });

  // State for editing a task
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast(); // Hook for displaying toast messages
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Track online/offline status

  // Function to show toast notifications
  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "default" | "destructive" = "default",
    ) => {
      toast({ title, description, variant });
    },
    [toast],
  );

  // Effect to save tasks to local storage whenever tasks state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Function to update the online/offline status
  const updateOnlineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  // Effect to set up event listeners for online/offline status
  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Function to add a new task or update an existing one
  const handleAddTask = () => {
    if (title.trim() === "") return; // Prevent adding empty tasks

    if (editingTask) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...task, title, description } : task,
        ),
      );
      setEditingTask(null); // Clear editing state
      showToast("Task Updated", `The task "${title}" has been updated.`);
    } else {
      // Create a new task
      const newTask: Task = {
        id: Date.now(), // Unique ID based on timestamp
        title,
        description,
        completed: false, // New tasks are initially not completed
      };
      setTasks([...tasks, newTask]); // Add new task to the list
      showToast("Task Added", `A new task "${title}" has been added.`);
    }

    // Reset input fields
    setTitle("");
    setDescription("");
  };

  // Function to set task for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task); // Set the current task to be edited
    setTitle(task.title); // Populate title input with task title
    setDescription(task.description); // Populate description input with task description
  };

  // Function to delete a task
  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find((task) => task.id === id); // Find the task to be deleted
    setTasks(tasks.filter((task) => task.id !== id)); // Remove the task from the list
    if (taskToDelete) {
      showToast(
        "Task Deleted",
        `The task "${taskToDelete.title}" has been deleted.`,
      );
    }
  };

  // Function to toggle the completion status of a task
  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <>
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Todo List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Input fields for title and description */}
              <Input
                placeholder="Enter Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Enter Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button className="w-full" onClick={handleAddTask}>
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              {/* Display tasks or a message if no tasks are available */}
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500">No todos available</p>
              ) : (
                tasks.map((task) => (
                  <Card
                    key={task.id}
                    className={task.completed ? "bg-gray-100" : ""}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                        />
                        <div>
                          <h3
                            className={`font-semibold ${task.completed ? "line-through text-gray-500" : ""}`}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-600"}`}
                          >
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Edit and Delete buttons */}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit task</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete task</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Render the offline message if the user is offline */}
        {isOffline && <OfflineMessage />}
      </div>
      <Toaster /> {/* Toast notifications for user feedback */}
    </>
  );
}
