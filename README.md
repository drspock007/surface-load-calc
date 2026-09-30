# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0c8bacb7-5dd1-445a-8f8c-e02048c9dcfa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0c8bacb7-5dd1-445a-8f8c-e02048c9dcfa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0c8bacb7-5dd1-445a-8f8c-e02048c9dcfa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Calculation PDF reports

The results export is generated locally from the displayed saved calculation, using jsPDF and AutoTable. It does not capture HTML or rerun the engine. `src/reports/reportModel.ts` maps stored fields and their actual units; `renderReport.ts` handles A4 typography, tables and pagination. Fonts and the renderer load only when exporting. The DejaVu font license is included with the font assets. The manual keeps its existing export.

Run report tests with `npm test -- src/reports/__tests__`. To produce representative PDFs for visual review, run `REPORT_QA_DIR=tmp/pdfs npm test -- src/reports/__tests__/renderReport.test.ts`, then render every page with Poppler. The fixtures are examples, not project design records.

A changed draft is never substituted into a report for an older result. Such reports identify that draft changes are excluded. Missing historical values are shown as N/A. Intermediate engine outputs sometimes retain imperial field names after conversion; the explicit report unit mapping accounts for this.
