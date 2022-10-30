import { forwardRef, useEffect, useState } from "react";

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
  LinearProgress,
  List,
  ListItem,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const api_url = import.meta.env.VITE_API_URL;
const api_key = import.meta.env.VITE_API_KEY;
axios.defaults.baseURL = api_url;
axios.defaults.headers["X-BRS-API-KEY"] = api_key;

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
  const [error, setError] = useState<AxiosError | null>(null);
  axios.interceptors.response.use(
    (resp) => {
      return resp;
    },
    (err) => {
      setError(err);
      return Promise.reject(err);
    }
  );
  const [password, setPassword] = useState("arsenal1");
  const [showModal, setShowModal] = useState(false);

  var nextWeek = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  const [date, setDate] = useState(nextWeek);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookings, setBookings] = useState({ jobs: [] });

  const loadBookings = () => {
    setIsLoadingBookings(true);
    return axios.get("/curr_bookings/").then((resp) => {
      setBookings(resp.data);
      setIsLoadingBookings(false);
    });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAddBooking = () => {
    if (isBooking) {
      return;
    }
    setIsBooking(true);
    axios
      .post("/scheduler/booking/", {
        date: format(date, "yyyy/MM/dd"),
        hour,
        minute,
      })
      .then(loadBookings)
      .finally(() => setIsBooking(false));
  };

  const handleClose = () => {
    if (!password) {
      return;
    }
    setShowModal(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssBaseline />
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            There was an issue, error: "{error.message}".
          </Alert>
        </Snackbar>
      )}

      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.grey[100],
          overflowY: "auto",
        }}
        position="absolute"
        left={0}
        top={0}
        right={0}
        bottom={0}
        pt={10}
        display="flex"
        flexDirection={"column"}
        justifyContent="flex-start"
        alignItems={"center"}
      >
        <AppBar position="fixed">
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
        <Box>
          <Box height={"4px"}>{isBooking && <LinearProgress />}</Box>
          <Box component={Paper} mb={2} mx={2} p={2} width={300}>
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
                <Button
                  variant="contained"
                  disabled={isBooking}
                  onClick={handleAddBooking}
                >
                  Book
                </Button>
              </Box>
            </form>
          </Box>
        </Box>

        <Box mx={2}>
          <Box height={"4px"}>{isLoadingBookings && <LinearProgress />}</Box>
          <Box component={Paper} p={2} minWidth={300}>
            <List>
              <Typography variant={"h5"}>Scheduled</Typography>
              {bookings.jobs.map((b) => {
                return (
                  <ListItem key={b.id}>
                    Tee time: {b.id}, Booking time: {b.time}
                  </ListItem>
                );
              })}
            </List>
          </Box>
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
      </Box>
    </LocalizationProvider>
  );
}

export default App;
