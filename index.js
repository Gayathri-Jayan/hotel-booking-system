const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());  // To handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());  // To parse JSON request bodies

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,  // e.g., 'localhost'
    user: process.env.DB_USER,  // e.g., 'root'
    password: process.env.DB_PASSWORD,  // your MySQL password
    database: process.env.DB_NAME  // e.g., 'hotel_booking'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database.');
    }
});

// API Endpoints

// Fetch Available Rooms
app.get('/api/rooms', (req, res) => {
    const query = "SELECT * FROM Rooms WHERE Status = 'Available'";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);  // If an error occurs during the query
        }
        res.json(results);  // Return the available rooms as JSON
    });
});

// Add a Booking
app.post('/api/bookings', (req, res) => {
    const { guestId, roomId, checkInDate, checkOutDate } = req.body;

    const query = "INSERT INTO Bookings (GuestID, RoomID, CheckInDate, CheckOutDate) VALUES (?, ?, ?, ?)";
    db.query(query, [guestId, roomId, checkInDate, checkOutDate], (err, result) => {
        if (err) {
            return res.status(500).send(err);  // If an error occurs during the query
        }
        res.status(201).send('Booking created successfully');  // Return success message
    });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.post('/api/bookings', (req, res) => {
    const { guestId, roomId, checkInDate, checkOutDate } = req.body;

    // Check if the room is available
    const checkRoomQuery = "SELECT * FROM Rooms WHERE RoomID = ? AND Status = 'Available'";
    db.query(checkRoomQuery, [roomId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) {
            return res.status(400).send('Room is not available');
        }

        // Proceed with the booking
        const query = "INSERT INTO Bookings (GuestID, RoomID, CheckInDate, CheckOutDate) VALUES (?, ?, ?, ?)";
        db.query(query, [guestId, roomId, checkInDate, checkOutDate], (err, result) => {
            if (err) return res.status(500).send(err);

            // Update room status to 'Booked'
            const updateRoomQuery = "UPDATE Rooms SET Status = 'Booked' WHERE RoomID = ?";
            db.query(updateRoomQuery, [roomId], (err, result) => {
                if (err) return res.status(500).send(err);
                res.status(201).send('Booking created successfully');
            });
        });
    });
});


app.put('/api/rooms/:id', (req, res) => {
    const roomId = req.params.id;
    const { status } = req.body;

    const query = "UPDATE Rooms SET Status = ? WHERE RoomID = ?";
    db.query(query, [status, roomId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send('Room status updated');
    });
});


app.get('/api/bookings', (req, res) => {
    const query = "SELECT * FROM Bookings";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});



app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;

    // Delete booking
    const query = "DELETE FROM Bookings WHERE BookingID = ?";
    db.query(query, [bookingId], (err, result) => {
        if (err) return res.status(500).send(err);

        // Update the room status to 'Available'
        const roomQuery = "SELECT RoomID FROM Bookings WHERE BookingID = ?";
        db.query(roomQuery, [bookingId], (err, result) => {
            if (err) return res.status(500).send(err);
            const roomId = result[0].RoomID;

            const updateRoomQuery = "UPDATE Rooms SET Status = 'Available' WHERE RoomID = ?";
            db.query(updateRoomQuery, [roomId], (err, result) => {
                if (err) return res.status(500).send(err);
                res.send('Booking deleted and room status updated');
            });
        });
    });
});






