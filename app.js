import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [rooms, setRooms] = useState([]);
    const [newBooking, setNewBooking] = useState({
        guestId: '',
        roomId: '',
        checkInDate: '',
        checkOutDate: ''
    });

    useEffect(() => {
        // Fetch available rooms when the component mounts
        axios.get('http://localhost:5001/api/rooms')
            .then(response => {
                setRooms(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching rooms!', error);
            });
    }, []);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        // Add a booking
        axios.post('http://localhost:5001/api/bookings', newBooking)
            .then(response => {
                alert('Booking successful!');
            })
            .catch(error => {
                console.error('There was an error making the booking!', error);
            });
    };

    return (
        <div>
            <h1>Hotel Booking System</h1>
            <h2>Available Rooms</h2>
            <ul>
                {rooms.map(room => (
                    <li key={room.RoomID}>{room.RoomName} - {room.Status}</li>
                ))}
            </ul>

            <h2>Make a Booking</h2>
            <form onSubmit={handleBookingSubmit}>
                <input
                    type="number"
                    placeholder="Guest ID"
                    value={newBooking.guestId}
                    onChange={(e) => setNewBooking({ ...newBooking, guestId: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Room ID"
                    value={newBooking.roomId}
                    onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
                    required
                />
                <input
                    type="date"
                    value={newBooking.checkInDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
                    required
                />
                <input
                    type="date"
                    value={newBooking.checkOutDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkOutDate: e.target.value })}
                    required
                />
                <button type="submit">Book Now</button>
            </form>
        </div>
    );
};

export default App;
