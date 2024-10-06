import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import OfflineMessage from "@/components/OfflineMessage"; // Import the OfflineMessage component

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TodoList() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Track online/offline status

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Update online/offline status
  const updateOnlineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  useEffect(() => {
    // Add event listeners
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Clean up the event listeners on component unmount
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleAddTask = () => {
    if (title.trim() === "") return;

    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...task, title, description } : task,
        ),
      );
      setEditingTask(null);
      showToast("Task Updated", `The task "${title}" has been updated.`);
    } else {
      const newTask: Task = {
        id: Date.now(),
        title,
        description,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      showToast("Task Added", `A new task "${title}" has been added.`);
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
      showToast(
        "Task Deleted",
        `The task "${taskToDelete.title}" has been deleted.`,
      );
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
        {/* Render the offline message if the user is offline */}
        {isOffline && <OfflineMessage />}
      </div>
      <Toaster />
    </>
  );
}
