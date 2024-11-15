# Event Check-In App

This is an enterprise-level event management and check-in application that allows users to register for events, receive unique QR codes for authentication, and check in securely at event locations. The app includes features for user registration, event creation, QR code generation and verification, and in-depth analytics for event organizers.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Frontend Structure](#frontend-structure)
- [Backend Structure](#backend-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure signup, login, and email verification.
- **Event Creation and Management**: Admins can create and manage events, including setting location, date, and capacity.
- **QR Code Generation**: Each event registration generates a unique QR code for user entry.
- **QR Code Check-In**: Security staff can scan and validate QR codes in real-time at the event.
- **User Dashboard**: Allows users to view registered events and access QR codes.
- **Admin Dashboard**: Provides admins with tools to manage events, view attendee lists, and analyze event data.
- **Feedback and Analytics**: Collect user feedback and display event analytics for organizers.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React (or Next.js), Tailwind CSS, Zustand for state management
- **QR Code Generation**: `qrcode` library for generating QR codes
- **QR Code Scanning**: `react-qr-reader` for scanning and verifying QR codes

## Installation

### Prerequisites
- Node.js and npm
- MongoDB server
- Optional: Docker for containerized deployment


