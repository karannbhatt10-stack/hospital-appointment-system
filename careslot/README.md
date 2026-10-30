# CareSlot – Hospital Appointment Booking System

A responsive single-page web app for booking and managing hospital appointments. Built as an AI-assisted project for Semester 3, CSE (AI/ML), Marwadi University.

**Live demo:** https://YOUR-USERNAME.github.io/careslot/

![CareSlot home page](screenshots/home.png)

## Features

- Book an appointment by department, doctor, date and time slot
- Doctor list and time slots update based on earlier choices
- Booked and already-passed slots are disabled, so double booking is prevented
- Validation on every field with clear error messages
- Appointment list with live search and status and department filters
- Status workflow: Pending, Confirmed, Completed, Cancelled, plus two-step delete
- Hero panel with the next appointment and summary counts
- Toast notifications for every action
- Data saved in the browser with localStorage
- Responsive layout with automatic dark mode

## Tech stack

HTML5, CSS3 (custom properties, grid, flexbox), vanilla JavaScript, localStorage, Google Fonts (Public Sans). No build step and no dependencies.

## Project structure

```
careslot/
├── index.html          # page markup
├── css/
│   └── style.css       # styles and light/dark theme
├── js/
│   └── app.js          # validation, slot logic, filtering, storage
├── screenshots/        # images used in this README
├── .gitignore
├── LICENSE
└── README.md
```

## Run locally

Open `index.html` in any modern browser. No server or installation is needed.

## Deploy with GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. After a minute, the site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## How AI was used

The app was designed and built with Claude (Anthropic) through three prompts: problem and feature analysis, full code generation, then a review prompt that added validation and toast notifications.

## Future improvements

- Backend and database so data is shared across devices
- Login with patient and staff roles
- Email or SMS reminders
- Edit and reschedule appointments
- Doctor working hours and leave days

## Author

YOUR NAME · Enrollment No. XXXXXXXX · Division X

## License

MIT – see [LICENSE](LICENSE).
