import React from 'react';
    import { Typography, Box } from '@mui/material';

    function HomePage() {
      return (
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to the Travel Blog!
          </Typography>
          <Typography variant="body1">
            Share your travel stories and inspire others to explore the world.
            Whether you've visited famous landmarks or discovered hidden gems, your
            experiences can help others plan their own adventures.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Use the navigation menu to write your story or view stories shared by
            other travelers.
          </Typography>
        </Box>
      );
    }

    export default HomePage;
