import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card sx={{ height: '100%' }} className="card-hover">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: `${color}.light`, 
              p: 1, 
              borderRadius: '50%', 
              display: 'flex' 
            }}
          >
            {React.cloneElement(icon, { color: color })}
          </Box>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;