const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory bookings
let bookings = [];

// 🔹 This is a route for booking a room
app.post("/bookRoom", (req, res) => {
    const { guestName, age, gender, roomType, roomGender, checkInDate, nights, guests, paymentMethod, } = req.body;

    // 🔹 Check if the required fields are provided
    if (!guestName || !age || !gender || !roomType || !roomGender || !checkInDate || !nights || !guests) {
        return res.status(400).json({ status: "error", message: "Бүх талбарыг оруулах шаардлагатай" });
    }

    // 🔹 Check if the age is valid
    if (age < 18) {
        return res.status(400).json({ status: "error", message: "18 нас хүрээгүй хүмүүс өрөө захиалах боломжгүй" });
    }

    // 🔹 Check if the gender is valid
    if (!["male", "female"].includes(gender)) {
        return res.status(400).json({ status: "error", message: "Хүйс нь эрэгтэй эсвэл эмэгтэй байх ёстой" });
    }

    // 🔹 Check if the room gender is valid
    if (!["maleOnly", "femaleOnly", "mixed"].includes(roomGender)) {
        return res.status(400).json({ status: "error", message: "roomGender must be maleOnly, femaleOnly or mixed" });
    }

    // 🔹 Check if the room type is full
    const roomTypeBookings = bookings.filter(b => b.roomType === roomType);
    if (roomTypeBookings.length >= 6) {
        return res.status(400).json({ status: "error", message: "Room type is full" });
    }
    // 🔹 Check if the payment method is valid
    if (!["cash", "card"].includes(paymentMethod)) {
        return res.status(400).json({ status: "error", message: "paymentMethod must be cash or card" });
    }
    // 🔹 Calculate the cost based on the room type
    let cost = 0;
    switch (roomType) {
        case "Normal":
            cost = 50000;
            break;
        case "fancy":
            cost = 80000;
            break;
        case "deluxe":
            cost = 120000;
            break;
        default:
            return res.status(400).json({ status: "error", message: "roomType must be normal, fancy or deluxe" });
    }

    if (nights >= 3) {
        cost *= 0.9;
    }

    cost *= nights;

    // 🔹 Save the booking
    const booking = {
        id: bookings.length + 1,
        guestName,
        age,
        gender,
        roomType,
        roomGender,
        checkInDate,
        nights,
        guests,
        paymentMethod,
        cost,
        booked: roomType === "Normal" ? bookings.filter(b => b.roomType === "Normal").length : (roomType === "fancy" ? bookings.filter(b => b.roomType === "fancy").length : bookings.filter(b => b.roomType === "deluxe").length),
        free: roomType === "Normal" ? 6 - bookings.filter(b => b.roomType === "Normal").length : (roomType === "fancy" ? 6 - bookings.filter(b => b.roomType === "fancy").length : 6 - bookings.filter(b => b.roomType === "deluxe").length)
    };

    bookings.push(booking);

    res.json({ status: "success", message: "Room booked successfully", booking });
});

// 🔹 This is a route for getting bookings
app.get("/bookings", (req, res) => {
    // 🔹 Get the free rooms for each room type
    const freeRooms = {
        normal: 6 - bookings.filter(b => b.roomType === "Normal").length,
        fancy: 6 - bookings.filter(b => b.roomType === "fancy").length,
        deluxe: 6 - bookings.filter(b => b.roomType === "deluxe").length
    };

    res.json({ status: "success", message: "Bookings fetched successfully", bookings, freeRooms });
});

app.listen(5000, () =>
    console.log("Server is running on port 5000")

);
