import React from 'react';
    import {
      Card,
      CardContent,
      Typography,
      CardMedia,
      Box,
    } from '@mui/material';

    function BlogPost({ post }) {
      return (
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              {post.country}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              By: {post.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {post.story}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {post.images &&
                post.images.map((image, i) => (
                  <CardMedia
                    key={i}
                    component="img"
                    image={image}
                    alt="Uploaded"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      marginBottom: 1,
                    }}
                  />
                ))}
            </Box>
          </CardContent>
        </Card>
      );
    }

    export default BlogPost;
