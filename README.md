# 🦷 Dental Clinic Management System

A modern, full-featured web application for managing dental clinic operations, including patients, appointments, inventory, billing, and reporting.

---

## Table of Contents
- [System Overview](#system-overview)
- [Features](#features)
- [User Manual](#user-manual)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## System Overview
This system streamlines the daily workflow of a dental clinic, providing an all-in-one platform for:
- Patient management
- Appointment scheduling
- Inventory tracking
- Billing and payments
- Treatment records
- Reporting and analytics

It is designed for use by receptionists, dentists, managers, and nurses, with role-based access to features.

---

## Features
- **Authentication & Role Management:** Secure login with role-based access (receptionist, dentist, manager, nurse).
- **Dashboard:** Real-time overview of clinic activity (appointments, patients, revenue, inventory).
- **Patient Management:** Add, edit, and view patient records and histories.
- **Appointment Management:** Schedule, update, and track appointments with status and doctor assignment.
- **Inventory Management:** Track supplies, low stock alerts, expiry management.
- **Billing:** Create invoices, mark as paid, track revenue, and link to appointments and treatments.
- **Treatment Records:** Record treatments per appointment, link to billing.
- **Reports:** Visual analytics for appointments, billing, patients, inventory, and treatments.
- **Responsive UI:** Works on desktop and tablet.

---

# User Manual

## Table of Contents
- [1. Logging In](#1-logging-in)
- [2. Dashboard Overview](#2-dashboard-overview)
- [3. Patient Management](#3-patient-management)
- [4. Appointment Management](#4-appointment-management)
- [5. Inventory Management](#5-inventory-management)
- [6. Billing & Invoicing](#6-billing--invoicing)
- [7. Treatment Records](#7-treatment-records)
- [8. Reports & Analytics](#8-reports--analytics)
- [9. User Roles & Permissions](#9-user-roles--permissions)
- [10. FAQ & Troubleshooting](#10-faq--troubleshooting)

---

## 1. Logging In
- Open the application in your browser.
- Enter your email and password.
- Click **Login**.
- The system will show features based on your role (Receptionist, Dentist, Manager, Nurse).

---

## 2. Dashboard Overview
- After login, you land on the **Dashboard**.
- See today's appointments, total patients, low stock items, and today's revenue.
- View a list of recent appointments.

---

## 3. Patient Management
### Add a New Patient
1. Go to the **Patients** tab.
2. Click **Add Patient**.
3. Fill in the patient's details (name, gender, date of birth, contact info, etc.).
4. Click **Save**.

### Edit or Delete a Patient
- Click the **Edit** or **Delete** button next to a patient's name.

### Search Patients
- Use the search bar to find patients by name, phone, or email.

---

## 4. Appointment Management
### Schedule a New Appointment
1. Go to the **Appointments** tab.
2. Click **Schedule Appointment**.
3. Select a patient and dentist.
4. Choose date, time, and room.
5. Set the status (scheduled, completed, cancelled).
6. Click **Save**.

### Edit or Cancel an Appointment
- Click **Edit** to change details.
- Click **Cancel** to remove the appointment.

### View Appointments
- See all upcoming and past appointments in a list.

---

## 5. Inventory Management
### View Inventory
- Go to the **Inventory** tab.
- See all items, quantities, unit costs, suppliers, and expiry dates.

### Add or Edit Inventory Items
1. Click **Add Item** or **Edit** next to an item.
2. Enter or update details (name, quantity, cost, supplier, expiry).
3. Click **Save**.

### Low Stock & Expiry Alerts
- Items below the low stock threshold are highlighted.
- Items nearing expiry are flagged.

---

## 6. Billing & Invoicing
### Create a New Invoice
1. Go to the **Billing** tab.
2. Click **Create Invoice**.
3. Select a **Patient**.
4. Select an **Appointment** (filtered by patient).
5. Select one or more **Treatments/Items** for that appointment.
6. The **Amount** is auto-calculated from selected items.
7. Choose **Payment Method** (Cash or Credit).
8. Click **Create Invoice**.

### Mark Invoice as Paid
- In the invoice list, click **Mark as Paid** for pending invoices.

### View Invoices
- See all invoices, their status, and payment method.

---

## 7. Treatment Records
### Add Treatments
1. Go to the **Treatments** tab or via an appointment.
2. Click **Add Treatment**.
3. Select patient, appointment, and enter treatment details (description, cost, notes).
4. Click **Save**.

### View Treatments
- See all treatments linked to appointments and patients.

---

## 8. Reports & Analytics
- Go to the **Reports** tab.
- View charts for:
  - Appointments (by status, by doctor, over time)
  - Billing (revenue, paid/unpaid, average invoice)
  - Patients (registrations, gender, age groups)
  - Inventory (low stock, expiring soon)
  - Treatments (most common, by doctor)
- Use these insights to make informed decisions.

---

## 9. User Roles & Permissions
- **Receptionist:** Full access to patients, appointments, billing, inventory.
- **Dentist:** Access to their appointments and treatments.
- **Manager:** Full access, including reports.
- **Nurse:** Limited access (mainly inventory).

---

## 10. FAQ & Troubleshooting
**Q: I can't create an invoice.**  
A: Make sure you select a patient, appointment, and at least one treatment/item.

**Q: Why don't I see some features?**  
A: Your role may not have permission for those features.

**Q: How do I reset my password?**  
A: Use the "Forgot Password" link on the login page (if enabled), or contact your manager.

**Q: Data isn't updating.**  
A: Try refreshing the page. If the problem persists, contact your system administrator.

---

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Recharts
- **Backend:** Supabase (Postgres, Auth, Storage)
- **State Management:** React Context
- **UI Components:** Custom + Shadcn/UI

---

## Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License
MIT




