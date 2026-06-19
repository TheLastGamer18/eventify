<div align="center">

# Eventify

A modern, full-stack event management platform designed for seamless event creation, discovery, and attendee engagement. Built with a focus on high-performance and a "brutalist" design aesthetic, it provides organizers with powerful tools to manage registrations, process payments, and engage their audience with real-time notifications.

<p align="center">
  <img src="https://img.shields.io/badge/downloads-12-brightgreen" alt="downloads">
  <img src="https://img.shields.io/badge/release-v1.0.0-blue" alt="release">
  <img src="https://img.shields.io/badge/last%20commit-may-yellow" alt="last commit">
  <img src="https://img.shields.io/badge/stars-0-blue" alt="stars">
  <img src="https://img.shields.io/badge/license-MIT-orange" alt="license">
</p>

## Features

</div>

- **Event Discovery**: Browse and search for upcoming events with a dynamic, responsive interface
- **Event Creation & Management**: Comprehensive tools for organizers to design events, set occupancy limits, and manage registration workflows
- **Advanced Analytics**: Dedicated dashboard for organizers to track attendee growth, revenue, and event performance
- **Secure Payments**: Integrated with Razorpay for handling paid event registrations and ticket sales
- **Real-time Notifications**: Native push notifications via OneSignal to keep attendees updated on event changes and reminders
- **Automated Certificates**: Generate and download PDF participation certificates automatically upon event completion
- **Secure Authentication**: Robust user authentication and session management powered by Better-Auth
- **Brutalist UI**: A bold, high-contrast design system built with Tailwind CSS and Radix UI

<div align="center">

## How It Works

</div>

1. Users and organizers authenticate securely using Better-Auth
2. Organizers design events, set details, specify occupancy limits, and define pricing for tickets
3. Attendees browse upcoming events and register or purchase tickets securely via Razorpay
4. Real-time push notifications are dispatched to keep attendees informed leading up to the event
5. Organizers track event performance and analytics through a dedicated dashboard
6. Upon event completion, automated PDF participation certificates are generated for attendees

<div align="center">

## Download or Visit

There are two ways to experience Eventify. You can either visit the live website or clone the repository to run it locally on your machine for development.

<p align="center">
  <a href="https://github.com/TheLastGamer18/eventify">
    <img src="https://img.shields.io/badge/CLONE_REPO-v1.0.0-1A73E8?style=for-the-badge" alt="Clone Repo" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/VISIT_WEBSITE-00C853?style=for-the-badge" alt="Visit Website" />
  </a>
</p>

## Setup Instructions

To run Eventify locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TheLastGamer18/eventify.git
   cd eventify
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy the `.env.example` template to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your API keys and configuration values for Supabase, Razorpay, OneSignal, Google Auth, and Better Auth.

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Visit `http://localhost:3000` in your browser.

## Contributing

Contributions are welcome. Please check CONTRIBUTING.md for technical details and setup instructions.

## Support

If you find this project useful, consider supporting the developer by starring the repository:

<p align="center">
  <a href="https://github.com/TheLastGamer18/eventify">
    <img src="https://img.shields.io/badge/Star_This_Repo-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Star Repository" />
  </a>
</p>

</div>
