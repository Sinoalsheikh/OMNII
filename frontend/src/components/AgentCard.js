import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';

const AgentCard = ({ agent, onDelete }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(agent._id);
    }
  };

  const handleChat = () => {
    navigate(`/chat/${agent._id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <SmartToyIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {agent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {agent.role}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            aria-label="agent options"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {agent.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={agent.personality?.trait || 'Professional'} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={agent.personality?.communicationStyle || 'Clear'} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>

        {agent.limitations && (
          <Typography variant="caption" color="warning.main">
            Limited functionality: {agent.limitations.reason}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<SchoolIcon />}
          onClick={() => navigate(`/agent/${agent._id}/training`)}
        >
          Train
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={handleChat}
        >
          Chat
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate(`/agent/${agent._id}/training`);
        }}>
          <PsychologyIcon fontSize="small" sx={{ mr: 1 }} /> Training
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default AgentCard;
