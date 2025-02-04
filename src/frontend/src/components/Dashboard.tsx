import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  progress: number;
}

interface Agent {
  id: string;
  type: string;
  status: string;
  performance_metrics: {
    success_rate: number;
    avg_response_time: number;
    error_rate: number;
  };
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
    const interval = setInterval(() => {
      fetchTasks();
      fetchAgents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks/');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/agents/');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        setNewTask({ title: '', description: '', priority: 1 });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Task Distribution Dashboard
        </Typography>

        {/* Create New Task Form */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Create New Task
          </Typography>
          <form onSubmit={handleCreateTask}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: parseInt(e.target.value, 10),
                    })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Task'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Tasks Table */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Active Tasks
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={task.progress}
                        size={24}
                        sx={{ mr: 1 }}
                      />
                      {task.progress}%
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Agents Status */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            AI Agents Status
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Success Rate</TableCell>
                <TableCell>Avg Response Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.type}</TableCell>
                  <TableCell>{agent.status}</TableCell>
                  <TableCell>
                    {agent.performance_metrics.success_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {agent.performance_metrics.avg_response_time.toFixed(2)}s
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;