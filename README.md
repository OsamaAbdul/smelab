# SMElab Launchpad Africa

SMElab Launchpad Africa is a comprehensive digital platform designed to empower Small and Medium Enterprises (SMEs) in Africa. The platform streamlines the complex processes of business registration, compliance, and growth, while providing access to professional consultants and AI-powered tools to accelerate business success.

## Project Overview

This application serves as a dual-interface platform catering to two distinct user groups:
1.  **SME Owners**: Entrepreneurs looking to register their business with the CAC (Corporate Affairs Commission), manage compliance, create marketing assets, and access professional guidance.
2.  **Consultants**: Accredited professionals who verify registrations, review compliance documents, and provide specialized services to SMEs.

## Key Features

### SME Dashboard
The SME Dashboard is the command center for business owners, offering:
*   **Business Registration (CAC)**: step-by-step guidance and status tracking for business registration.
*   **AI Tools Suite**:
    *   **Logo Generator**: Create professional logos using AI (powered by Hugging Face FLUX.1-dev).
    *   **Flyer Generator**: Generate marketing flyers for various business needs.
    *   **Fallback Generation**: Robust fallback to SVG generation if AI limits are reached.
*   **Compliance Hub**: Track and manage regulatory requirements to remain compliant.
*   **Marketing Hub**: Tools and resources to boost brand visibility.
*   **Consultant Booking**: Direct channel to book and communicate with industry experts.
*   **Assets Gallery**: A centralized repository for all generated and uploaded business assets.

### Consultant Dashboard
A dedicated workspace for professionals to manage their workflow:
*   **CAC Verification**: Tools to review and verify business registration details.
*   **Compliance Reviews**: Interface for auditing SME compliance documents.
*   **Design Requests**: Manage and fulfill custom design requests from SMEs.
*   **Task Management**: Track pending reviews, consultations, and deadlines.
*   **Messaging System**: Direct communication channel with SME clients.

## Technology Stack

This project is built using a modern, high-performance tech stack:

### Frontend
*   **Framework**: [React 18](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**:
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
    *   [Shadcn UI](https://ui.shadcn.com/) - Reusable components built with Radix UI.
    *   [Framer Motion](https://www.framer.com/motion/) - For complex animations.
*   **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query).
*   **Routing**: [React Router](https://reactrouter.com/).
*   **Forms**: React Hook Form with Zod schema validation.
*   **Charts**: Recharts and Chart.js.

### Backend & Services
*   **Backend-as-a-Service**: [Supabase](https://supabase.com/).
    *   **Authentication**: Secure user management.
    *   **Database**: PostgreSQL.
    *   **Edge Functions**: Serverless functions (Deno) for heavy lifting like AI generation.
*   **AI Integration**: [Hugging Face Inference API](https://huggingface.co/inference-api) (FLUX.1-dev model).

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local backend development)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <project-directory>/client
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `client` directory. You will need the following variables:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    For the Edge Functions (located in `supabase/functions`), you need to set secrets in your Supabase project:
    ```bash
    supabase secrets set HF_TOKEN=your_hugging_face_token
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will actiavte at `http://localhost:8080` (or similar port).

## Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── api/             # API integration logic
│   ├── components/      # Reusable UI components
│   │   ├── Dashboard/   # SME Dashboard specific components
│   │   ├── Consultant/  # Consultant Dashboard specific components
│   │   └── ui/          # Shadcn UI primitives
│   ├── context/         # React Context definitions
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layout wrappers (Dashboard, Consultant)
│   ├── pages/           # Main route pages (Login, Index, etc.)
│   └── lib/             # Utilities and helper functions
├── supabase/
│   └── functions/       # Supabase Edge Functions (AI generation, etc.)
└── package.json         # Project dependencies and scripts
```

## Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
