<div align="center">

# Eventify 🎟️

**A modern, full-stack event management platform with a bold "brutalist" design.**

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

[Report Bug](https://github.com/TheLastGamer18/eventify/issues) · [Request Feature](https://github.com/TheLastGamer18/eventify/issues)

</div>

---

## 📖 About The Project

Eventify is designed for seamless event creation, discovery, and attendee engagement. Built with a focus on high performance and a distinctive brutalist design aesthetic, it equips organizers with powerful tools to manage registrations, process payments securely, and engage audiences with real-time notifications.

### ⚡ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
- **Payments**: [Razorpay](https://razorpay.com/)
- **Notifications**: [OneSignal](https://onesignal.com/)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)

---

## ✨ Features

- **Event Discovery**: Browse and search for upcoming events with a dynamic, responsive interface.
- **Event Management**: Comprehensive tools for organizers to design events, set occupancy limits, and manage registration workflows (including manual approvals).
- **Advanced Analytics**: Dedicated dashboards to track attendee growth, revenue, and event performance.
- **Secure Payments**: Integrated Razorpay checkout for handling paid event registrations and ticket sales.
- **Real-time Notifications**: Native push notifications via OneSignal to keep attendees updated on event changes and reminders.
- **Automated Certificates**: Generate and download PDF participation certificates automatically upon event completion.
- **Brutalist UI**: A bold, high-contrast design system that stands out.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine for development and testing.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account for the database
- A [Razorpay](https://razorpay.com/) account for payments
- A [Better-Auth](https://better-auth.com/) supported database (Supabase works perfectly)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheLastGamer18/eventify.git
   cd eventify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Copy the example environment file to create your local environment:
   ```bash
   cp .env.example .env
   ```
   
   Open the `.env` file and fill in your keys:

   | Variable | Description |
   | :--- | :--- |
   | `EVENT_DATABASE_URL` | Your PostgreSQL connection string (e.g., Supabase DB URI) |
   | `BETTER_AUTH_SECRET` | A random 32-character string for securing sessions |
   | `BETTER_AUTH_URL` | Base URL for auth (e.g., `http://localhost:3000/api/auth`) |
   | `NEXT_PUBLIC_APP_URL` | Application base URL (`http://localhost:3000`) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
   | `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | OAuth Client Secret from Google Cloud Console |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Test/Live Key ID |
   | `RAZORPAY_KEY_SECRET` | Razorpay Test/Live Key Secret |
   | `NEXT_PUBLIC_ONESIGNAL_APP_ID` | OneSignal App ID for push notifications |
   | `ONESIGNAL_REST_API_KEY` | OneSignal REST API Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please review our [Contributing Guidelines](CONTRIBUTING.md) for detailed technical instructions.

---

## 💖 Support & Acknowledgements

If you find this project useful or it helped you learn something new, please consider giving it a ⭐! 

<p align="left">
  <a href="https://github.com/TheLastGamer18/eventify">
    <img src="https://img.shields.io/badge/Star_This_Repo-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Star Repository" />
  </a>
</p>

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
