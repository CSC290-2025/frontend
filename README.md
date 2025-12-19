# Smart City Hub (Frontend)

Frontend application for the Smart City Hub project.

## Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS recommended)
- **pnpm**: 10.17.1 (via Corepack)

## Setup Instructions

1. **Clone the repository**

   ```sh
   git clone https://github.com/CSC290-2025/frontend.git
   cd frontend
   ```

2. **Enable Corepack**

   Corepack ensures consistent package manager versions across environments.

   ```sh
   corepack enable
   ```

3. **Install dependencies**

   ```sh
   pnpm install
   ```

4. **Generate API client (local)**

   ```sh
   pnpm run api:generate-local
   ```

5. **Configure environment variables**

   Create and configure your .env file as needed:

   ```sh
   cp .env.example .env
   ```

6. **Run the development server**
   ```sh
   pnpm run dev
   ```

## Academic Context

This project is developed for CSC290: Integrated Project I,
Bachelor of Science in Computer Science,
School of Information Technology,
King Mongkut's University of Technology Thonburi (KMUTT),
Academic Year 2025.

## License

This project is for academic use only and is not intended for commercial distribution.
