import { useEffect, useState } from "react";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./App.css";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import { format } from "date-fns";

const api_url = import.meta.env.VITE_API_URL;
console.log(api_url);
function App() {
  const [password, setPassword] = useState("arsenal1");
  const [showModal, setShowModal] = useState(false);

  var nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  const [date, setDate] = useState(nextWeek);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);

  const [bookings, setBookings] = useState({ jobs: [] });
  useEffect(() => {
    axios.get(api_url + "/curr_bookings/").then((resp) => {
      setBookings(resp.data);
    });
  }, []);
  const handleAddBooking = () => {
    axios
      .post(api_url + "/scheduler/booking/", {
        date: format(date, "yyyy/MM/dd"),
        hour,
        minute,
      })
      .then(() => {
        axios.get(api_url + "/curr_bookings/").then((resp) => {
          setBookings(resp.data);
        });
      });
  };
  const handleClose = () => {
    if (!password) {
      return;
    }
    setShowModal(false);
  };
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AppBar>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, textAlign: "left" }}
            >
              Golf app
            </Typography>
            <Button
              variant="outlined"
              sx={{ color: "white" }}
              onClick={() => setShowModal(true)}
            >
              Change password
            </Button>
          </Toolbar>
        </AppBar>
        <Box component={Paper} m={4}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddBooking();
            }}
          >
            <Typography variant="h5">Add booking</Typography>
            <Box p={2}>
              <DatePicker
                value={date}
                onChange={(e) => setDate(e)}
                inputFormat={"dd/MM/yyyy"}
                renderInput={(params) => <TextField {...params} />}
                label="date"
              />
            </Box>
            <Box p={2} display="flex" alignItems="center">
              <TextField
                fullWidth
                select
                onChange={(e) => setHour(e.target.value)}
                value={hour}
                label="hour"
              >
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={7}>7</MenuItem>
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={9}>9</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={11}>11</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={13}>13</MenuItem>
                <MenuItem value={14}>14</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={16}>16</MenuItem>
                <MenuItem value={17}>17</MenuItem>
                <MenuItem value={18}>18</MenuItem>
              </TextField>
              <Typography variant={"h5"}>:</Typography>
              <TextField
                fullWidth
                select
                onChange={(e) => setMinute(e.target.value)}
                value={minute}
                label="minute"
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </TextField>
            </Box>
            <Box p={2} display="flex" justifyContent={"flex-end"}>
              <Button variant="contained" onClick={handleAddBooking}>
                Book
              </Button>
            </Box>
          </form>
        </Box>

        <Box component={Paper} m={4}>
          <List>
            <Typography variant={"h5"}>Scheduled</Typography>
            {bookings.jobs.map((b) => {
              return (
                <ListItem>
                  {b[0]}, {b[1]}
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Dialog open={showModal} onClose={handleClose}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowModal(false);
            }}
          >
            <DialogTitle>Enter your BRS password</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={handleClose}
                disabled={password === ""}
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </LocalizationProvider>
    </>
  );
}

export default App;
