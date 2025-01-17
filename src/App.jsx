import React, { useState } from 'react';
    import {
      AppBar,
      Toolbar,
      Typography,
      Drawer,
      List,
      ListItem,
      ListItemIcon,
      ListItemText,
      IconButton,
      Box,
      Divider,
    } from '@mui/material';
    import MenuIcon from '@mui/icons-material/Menu';
    import HomeIcon from '@mui/icons-material/Home';
    import EditIcon from '@mui/icons-material/Edit';
    import BookIcon from '@mui/icons-material/Book';
    import {
      BrowserRouter as Router,
      Routes,
      Route,
      Link,
      useNavigate,
    } from 'react-router-dom';
    import TravelForm from './components/TravelForm';
    import BlogPost from './components/BlogPost';
    import HomePage from './components/HomePage';

    function App() {
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [blogPosts, setBlogPosts] = useState([]);
      const navigate = useNavigate();

      const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
      };

      const handleDrawerItemClick = (path) => {
        navigate(path);
        setDrawerOpen(false);
      };

      const handlePostSubmit = (newPost) => {
        setBlogPosts([...blogPosts, newPost]);
      };

      return (
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Travel Blog
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            open={drawerOpen}
            onClose={handleDrawerToggle}
            PaperProps={{ sx: { width: 240 } }}
          >
            <Toolbar />
            <Divider />
            <List>
              <ListItem
                button
                onClick={() => handleDrawerItemClick('/')}
                component={Link}
                to="/"
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleDrawerItemClick('/write')}
                component={Link}
                to="/write"
              >
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary="Write Story" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleDrawerItemClick('/stories')}
                component={Link}
                to="/stories"
              >
                <ListItemIcon>
                  <BookIcon />
                </ListItemIcon>
                <ListItemText primary="View Stories" />
              </ListItem>
            </List>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/write"
                element={<TravelForm onSubmit={handlePostSubmit} />}
              />
              <Route
                path="/stories"
                element={
                  <Box>
                    {blogPosts.map((post, index) => (
                      <BlogPost key={index} post={post} />
                    ))}
                  </Box>
                }
              />
            </Routes>
          </Box>
        </Box>
      );
    }

    export default App;
