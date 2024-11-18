const express = require('express');
const app = express();
const PORT = process.env.PORT || 8005;

app.use(express.json());

let rooms = [
    { id: 1, name: "Room 1", seats: 20, amenities: ["Projector", "Whiteboard"], pricePerHour: 50 },
    { id: 2, name: "Room 2", seats: 15, amenities: ["TV", "Conference phone"], pricePerHour: 40 }
];

let customers = [
    { id: 1, name: "John", email: "john@example.com", phoneNumber: "1234567890" },
    { id: 2, name: "Jane", email: "jane@example.com", phoneNumber: "9876543210" }
];

let bookings = [
    { id: 1, customerName: "John", date: "2024-05-16", startTime: "09:00", endTime: "10:00", roomId: 1, status: "Booked" },
    { id: 2, customerName: "Jane", date: "2024-05-17", startTime: "10:00", endTime: "11:00", roomId: 2, status: "Booked" }
];

// Creating a room
app.post('/rooms/create', (req, res) => {
    const { name, seats, amenities, pricePerHour } = req.body;
    const room = { id: rooms.length + 1, name, seats, amenities, pricePerHour };
    rooms.push(room);
    res.status(201).json({ message: 'Room created successfully', room });
});

// Booking a room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check room availability
    const isRoomAvailable = bookings.every(booking => {
        return (
            booking.roomId !== roomId ||
            booking.date !== date ||
            (startTime >= booking.endTime || endTime <= booking.startTime)
        );
    });

    if (!isRoomAvailable) {
        return res.status(400).json({ message: 'Room already booked for the specified time' });
    }

    const booking = {
        id: bookings.length + 1,
        customerName: customerName.trim(), 
        date,
        startTime,
        endTime,
        roomId,
        status: 'Booked'
    };
    bookings.push(booking);
    res.status(201).json({ message: 'Room booked successfully', booking });
});

// Listing all booked rooms
app.get('/rooms', (req, res) => {
    const roomsWithBookings = rooms.map(room => {
        const bookingsForRoom = bookings.filter(booking => booking.roomId === room.id);
        return {
            ...room,
            bookings: bookingsForRoom
        };
    });
    res.json(roomsWithBookings);
});

// Listing all booked customers
app.get('/get-customers', (req, res) => {
  const customersWithBookings = bookings.map(booking => {
      const room = rooms.find(room => room.id === booking.roomId);
      if (room) {
          return {
              customerName: booking.customerName,
              roomName: room.name,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime
          };
      } else {
          return {
              customerName: booking.customerName,
              roomName: 'Room not found',
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime
          };
      }
  });
  res.json(customersWithBookings);
});


// Listing all customer's booking details
app.get('/customer-bookings/:customerName', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName.trim()); 
    res.json(customerBookings);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});