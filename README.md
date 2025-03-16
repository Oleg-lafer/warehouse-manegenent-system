# Warehouse Management System

## Overview
The **Warehouse Management System** is a full-stack application built from scratch using **TypeScript**, **React**, and **Node.js**. It serves as an **information management system** for warehouses, handling products, users, and operational processes.

The system is designed to run on a **Raspberry Pi**, which acts as the central unit for warehouse management. Future enhancements include **image processing** and **voice recognition** to enable hands-free operation.

---

## Features
- **User Management**: Register, authenticate, and manage users with different roles.
- **Product Management**: Add, update, and track inventory in real time.
- **Operations Management**: Log and monitor warehouse activities.
- **Raspberry Pi Integration**: The system runs on a Raspberry Pi, making it portable and efficient.
- **Future Enhancements**:
  - **Image Processing**: A camera module will be connected to the Raspberry Pi to recognize and track products using a custom-built model.
  - **Voice Commands**: A microphone will be integrated to allow voice-based interaction with the system.

---

## Tech Stack
### Backend:
- **Node.js** (with Express.js for API handling)
- **TypeScript**
- **SQLite / PostgreSQL** (for database management)

### Frontend:
- **React.js** (TypeScript-based)
- **Redux** (for state management)
- **TailwindCSS** (for styling)

### Hardware:
- **Raspberry Pi** (Primary computing device)
- **Camera Module** (Future integration for image recognition)
- **Microphone Module** (Planned for voice recognition)

---

## Installation & Setup
### Prerequisites:
- Node.js & npm installed
- Raspberry Pi (for hardware integration)

### Steps:
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/warehouse-management-system.git
   cd warehouse-management-system
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
4. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```
5. **Deploy on Raspberry Pi**
   - Follow Raspberry Pi setup instructions.
   - Run the backend as a service.
   - Connect the frontend to a local network.

---

## Future Development
- **Train and integrate an image recognition model** for automated product identification.
- **Implement voice command features** using speech-to-text processing.
- **Enhance the UI/UX** for improved user experience.

---

## Contributors
- Daniel Dahan
- Oleg Lafer Muraviov

For suggestions or contributions, feel free to open an issue or submit a pull request.



