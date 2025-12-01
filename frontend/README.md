# School Management System - Frontend

React-based frontend for the School Management System.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── dashboard/       # Dashboard components
│   ├── students/        # Student components
│   ├── teachers/        # Teacher components
│   ├── classes/         # Class components
│   ├── fees/            # Fee components
│   └── reportCards/     # Report card components
├── context/             # React Context providers
├── pages/               # Page components
├── services/            # API service layer
├── styles/              # CSS files
├── utils/               # Utility functions
└── App.jsx              # Main application component
```

## Features

### Authentication
- Login page with JWT authentication
- Protected routes
- Role-based access control
- Automatic token refresh

### Dashboard
- Role-specific dashboards (Admin, Teacher, Student)
- Quick access to key features
- Visual cards for navigation

### Student Management (Admin/Teacher)
- View all students
- Search and filter
- Add/Edit student records
- Enrollment management

### Teacher Management (Admin)
- View all teachers
- Add/Edit teacher records
- Assign classes and subjects

### Class Management (Admin)
- Create and manage classes
- Assign teachers
- Configure subjects

### Fee Management (Admin)
- View fee records
- Process payments
- Track due payments
- Fee summary reports

### Report Cards (Admin/Teacher/Student)
- Create and edit report cards
- Subject-wise marks entry
- Grade calculation
- Performance analytics
- Publish/unpublish reports

### Academic Year (Admin)
- Manage academic years
- Set active year
- Student promotion

## State Management

- React Context for authentication
- React Query for server state
- Local state with useState/useReducer

## Styling

- Custom CSS with CSS variables
- Responsive design
- Modern UI/UX
- Consistent color scheme

## API Integration

All API calls are handled through the `services/api.js` file which includes:
- Axios configuration
- Request/Response interceptors
- Error handling
- Token management

## Production Build

The production build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

Deploy the `dist` folder to your hosting service.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
