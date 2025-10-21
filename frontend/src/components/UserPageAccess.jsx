import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    CircularProgress,
    Typography,
    ListItem,
    ListItemText,
    Switch,
    Box,
    Container,
    CssBaseline,
    ThemeProvider,
    createTheme,
    AppBar,
    Toolbar,
    IconButton
} from '@mui/material';
import { FaRegMoon, FaMoon } from "react-icons/fa";

const UserPageAccess = () => {
    const [userFound, setUserFound] = useState(null);
    const [pages, setPages] = useState([]);
    const [pageAccess, setPageAccess] = useState({});
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('light');
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");

    const theme = createTheme({
        palette: {
            mode,
            primary: { main: '#800000' },
            secondary: { main: '#8B008B' },
        },
    });

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // 🔎 Search user and load their access
    const handleSearchUser = async (e) => {
        e.preventDefault();
        if (!userID) return;

        setLoading(true);
        try {
            const { data: allPages } = await axios.get('http://localhost:5000/api/pages');
            const { data: accessRows } = await axios.get(`http://localhost:5000/api/page_access/${userID}`);

            const accessMap = accessRows.reduce((acc, curr) => {
                acc[curr.page_id] = curr.page_privilege === 1;
                return acc;
            }, {});

            // default deny for any missing pages
            allPages.forEach((page) => {
                if (accessMap[page.id] === undefined) {
                    accessMap[page.id] = false;
                }
            });

            setUserFound({ id: userID });
            setPages(allPages);
            setPageAccess(accessMap);

        } catch (error) {
            console.error('Error searching user:', error);
            setUserFound(null);
            alert("User not found or error loading data");
        }
        setLoading(false);
    };

    useEffect(() => {
    
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");

        if (storedUser && storedRole && storedID) {
        setUser(storedUser);
        setUserRole(storedRole);
        setUserID(storedID);

        if (storedRole === "registrar") {
            
        } else {
            window.location.href = "/login";
        }
        } else {
        window.location.href = "/login";
        }
    }, []);

    // 🔄 Refresh pages & access
    const fetchPages = async () => {
        try {
            const { data: allPages } = await axios.get('http://localhost:5000/api/pages');
            const { data: accessRows } = await axios.get(`http://localhost:5000/api/page_access/${userID}`);

            const accessMap = accessRows.reduce((acc, curr) => {
                acc[curr.page_id] = curr.page_privilege === 1;
                return acc;
            }, {});

            allPages.forEach((page) => {
                if (accessMap[page.id] === undefined) {
                    accessMap[page.id] = false;
                }
            });

            setPages(allPages);
            setPageAccess(accessMap);
        } catch (err) {
            console.error("Error fetching pages or access:", err);
        }
    };

    // ✅ Toggle access on/off
    const handleToggleChange = async (pageId, hasAccess) => {
        const newAccessState = !hasAccess; // true = ON, false = OFF
        try {
            if (newAccessState) {
            // ✅ ON: Insert
            await axios.post(`http://localhost:5000/api/page_access/${userID}/${pageId}`);
            } else {
            // ❌ OFF: Delete
            await axios.delete(`http://localhost:5000/api/page_access/${userID}/${pageId}`);
            }
            await fetchPages(); // refresh data
        } catch (error) {
            console.error("Error updating page access:", error);
        }
    };

    const containerStyle = {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        boxSizing: 'border-box',
    };

    const formStyle = {
        width: '100%',
        maxWidth: '800px',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        border: '4px solid #000000',
    };

    return (
        <div style={containerStyle}>
            <div style={formStyle}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AppBar position="static" color="primary">
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                User Page Access
                            </Typography>
                            <IconButton color="inherit" onClick={toggleTheme}>
                                {mode === 'dark' ? <FaMoon /> : <FaRegMoon />}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Container
                        maxWidth="md"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mt: 4,
                            mb: 4,
                            p: 3,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 3,
                            border: '4px solid black',
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
                            User Page Access Management
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleSearchUser}
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', mb: 3 }}
                        >
                            <TextField
                                label="Enter User ID"
                                variant="outlined"
                                value={userID}
                                onChange={(e) => setUserID(e.target.value)}
                                required
                                sx={{ mr: 2 }}
                            />
                            <Button type="submit" variant="contained" color="primary">
                                Search User
                            </Button>
                        </Box>

                        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}

                        {userFound && (
                            <Box mt={4} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" align="center">
                                    Manage Page Access for User: ID {userFound.id}
                                </Typography>

                                {pages.length > 0 ? (
                                    pages.map((page) => {
                                        const pageId = page.id; // always from page_table
                                        const hasAccess = !!pageAccess[pageId];

                                        return (
                                            <ListItem
                                                key={pageId}
                                                divider
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                }}
                                            >
                                                <ListItemText
                                                    primary={page.page_description || 'Page Description Not Available'}
                                                    secondary={`ID: ${pageId}`}
                                                />
                                                <Switch
                                                    checked={hasAccess}   // ✅ true = access granted
                                                    onChange={() => handleToggleChange(pageId, hasAccess)}
                                                    color="primary"
                                                />

                                            </ListItem>
                                        );
                                    })
                                ) : (
                                    <Typography align="center">No pages found.</Typography>
                                )}
                            </Box>
                        )}

                        {!userFound && !loading && (
                            <Typography align="center">No user found. Please enter a valid User ID.</Typography>
                        )}
                    </Container>
                </ThemeProvider>
            </div>
        </div>
    );
};

export default UserPageAccess;