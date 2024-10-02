## Setup

1. Create a `.env` file in the root directory using `.env.example` as an example
2. In the `.env` file, add the keys according to the `env.example`. Refer to the "Secret List" Google Doc on our shared Google Drive folder

## Running the local host

Install dependencies first

```bash
npm install
```

Run localhost

```bash
npm run dev
```

## Notes

1. NextJs routing is dependent on the file system. Read more [here](https://nextjs.org/docs/pages/building-your-application/routing).

2. TailwindCSS is installed for easier styling, allows for inline styling [Documentation](https://tailwindcss.com/docs/installation). Further configuration might be necessary after component library is selected. For UI/UX leads, upon selection of theme, please input set of hex codes we are using into tailwind.config.ts

3. For file organisation, would be cleaner to have a src/components and put those components into src/pages


