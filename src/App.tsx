import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "./hooks/use-toast";

// Define the structure of a Task using TypeScript interface
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  synced: boolean;
}

export default function TodoList() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Initialize tasks from localStorage if available
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    if (isOnline) {
      syncTasksWithLocalStorage();
    }
  }, [tasks, isOnline]);

  const syncTasksWithLocalStorage = () => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      toast({
        title: "Tasks Saved",
        description: "Your tasks have been saved to local storage.",
      });
    } catch (error) {
      console.error("Failed to save tasks:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async () => {
    if (title.trim() === "") return;

    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...task, title, description } : task,
        ),
      );
      setEditingTask(null);
      toast({
        title: "Task Updated",
        description: `The task "${title}" has been updated.`,
      });
    } else {
      const newTask: Task = {
        id: Date.now(),
        title,
        description,
        completed: false,
        synced: false,
      };
      setTasks([...tasks, newTask]);
      toast({
        title: "Task Added",
        description: `A new task "${title}" has been added.`,
      });
    }

    setTitle("");
    setDescription("");
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find((task) => task.id === id);
    setTasks(tasks.filter((task) => task.id !== id));
    if (taskToDelete) {
      toast({
        title: "Task Deleted",
        description: `The task "${taskToDelete.title}" has been deleted.`,
      });
    }
  };

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
      </div>
      <Toaster />
    </>
  );
}
