# Project Name
pump.core

## Description

A brief description of your project.

## Project Structure

```
.env
.gitignore
components.json
next-env.d.ts
next.config.mjs
package.json
pnpm-lock.yaml
postcss.config.mjs
tailwind.config.ts
tsconfig.json
.next/
    app-build-manifest.json
    build-manifest.json
    package.json
    react-loadable-manifest.json
    trace
    cache/
    server/
    static/
    types/
app/
    globals.css
    header.tsx
    layout.tsx
    loading.tsx
    page.tsx
    providers.jsx
    coin/
components/
    calendars.tsx
    coin-card.tsx
    create-coin-modal.tsx
    date-picker.tsx
    ...
config/
    ...
hooks/
    ...
lib/
public/
styles/
```

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd <project-directory>
    ```
3. Install dependencies:
    ```sh
    pnpm install
    ```

## Usage

To start the development server, run:
```sh
pnpm dev
```

To build the project, run:
```sh
pnpm build
```

To start the production server, run:
```sh
pnpm start
```

## Configuration

- **Environment Variables**: Configure your environment variables in the `.env` file.
- **Tailwind CSS**: Tailwind CSS configuration can be found in `tailwind.config.ts`.
- **Next.js**: Next.js configuration can be found in `next.config.mjs`.

## Project Structure

- **app/**: Contains the main application components and pages.
- **components/**: Contains reusable UI components.
- **config/**: Contains configuration files.
- **hooks/**: Contains custom hooks.
- **lib/**: Contains utility functions and libraries.
- **public/**: Contains static assets.
- **styles/**: Contains global styles.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.
