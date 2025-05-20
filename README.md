## Getting Started

First clone repo to your local environment. You will want to be running node version greater than or equal to 16.

Run below command to install packages:

```bash
yarn install
```

Create a new file in root directory called:
`.env.local`

````
Ask a your lead or any engineer for the environment variables and place them in this new file.

Once everything is in place you can spin up a development server with:

```bash
yarn dev
````

Make sure you have prettier extension installed and setting to format on save.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/endpoint](http://localhost:3000/api/endpoint). This endpoint can be edited in `pages/api/endpoint.ts`.

## React Component Structure

## Imports

1. Start with third party packages
2. Then app components

## Component Structure

1. Start with hooks that require initialization
2. Context variables
3. Query & url params
4. Data hooks
5. Data mutations
6. useState's
7. Data variables
8. Component functions
9. useEffect's

## Payments

We use stripe as our payment processor.
If you are in development or preview environment you can use the below credit card info:

Card #: 4242 4242 4242 4242

Exp: Any future date

CVC: any 3 digits

## Data

Data is fetched using react-query. You can find and store data fetching hooks in:
`hooks/data.ts`

When create or updating database rows create react-query mutations. You can find examples and store new one's in:
`hooks/mutation.ts`

You can find more info on react-query at:

- [React Query Docs](https://tanstack.com/query/v4/docs/framework/react/overview).

## UI Library

We use MUI (material-ui) for our UI component library.
When importing MUI components, please import individually:

```
import Button from "@mui/material/Button";
import List from "@mui/material/List;
import Box from "@mui/material/Box;
```

DO NOT import with destructering:

```
import { Button, List, Box } from "@mui/material";
```

## Database Updates

We use supabase as our database. If you've made any updates to the database please run the npx supabase gen types command below and click save on "/database.types" file so it gets formatted properly.

```
Npx supabase login - make sure to generate access token from settings in supabase
Get access token from supabase => profile => account preferences => access_tokens

// generate types file
// Prod
npx supabase gen types typescript --project-id gcqrvlegvyiunwewkuoz --schema public > src/lib/database.types.d.ts

// Dev
npx supabase gen types typescript --project-id ordynhmcwwnczgnvuomz --schema public > src/lib/database.types.d.ts
```

This will ensure our codebase always has the proper types. Make sure to run prod command before pushing to code review.

## Code Review

When ready to submit a PR for code review:

- Create branch name based on ticket you are working on (e.g. ES-4321-task-completing)
- Create a pull request. This will generate a preview link where QA testing will occur.
- In a comment on the ticket, tag the QA tester and add any screen recordings of your testing. See example below:

```
READY FOR QA TESTING: @QATester.
PREVIEW LINK: "https://previewlink.example".
GITHUB: "https:github.link".
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## A/B Test

Import from AppContext:

`import { useVWO } from "@/context/VWOContext";`

Define client in your component:

`const vwoClient = useVWO();`

Get variant for current user:

```
const variationName = vwoClient?.activate(
    "Campaign Name", // Name of the experiment as configured in VWO
    patientInfo // Patient object
  );
```

Use the variant in code:

```
if (variationName == "Control") {
  // CODE: write code for Control
} else if (variationName == "Variation-name") {
  // CODE: write code for Variation
} else {
  // CODE: When user does not become part of campaign.
}
```

Track a conversion or other campaign metric:

`vwoClient.track("Campaign Name",  "Metric Name", patientInfo)`
