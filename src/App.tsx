import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2, Plus } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import OfflineMessage from "@/components/OfflineMessage";
import { Separator } from "@/components/ui/separator";

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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "default" | "destructive" = "default"
    ) => {
      toast({ title, description, variant });
    },
    [toast]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const updateOnlineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

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
          task.id === editingTask.id ? { ...task, title, description } : task
        )
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
        `The task "${taskToDelete.title}" has been deleted.`
      );
    }
  };

  const handleToggleComplete = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTask();
              }}
              className="space-y-4 mb-8"
            >
              <Input
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
              <Input
                placeholder="Task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </form>
            <Separator className="my-6" />
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No tasks yet. Add one above!
                </p>
              ) : (
                tasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`transition-all duration-300 ease-in-out ${
                      task.completed ? "opacity-50" : ""
                    }`}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          className="border-2"
                        />
                        <div>
                          <h3
                            className={`font-medium ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p
                              className={`text-sm mt-1 ${
                                task.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditTask(task)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit task</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
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
        {isOffline && <OfflineMessage />}
      </div>
      <Toaster />
    </div>
  );
}
