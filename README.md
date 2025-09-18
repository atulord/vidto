# Vidto

# Summary
A video gallery where users can create new videos, list videos, filter and search for them.


# Tech Stack
Frontend is NextJS App Router, React, Tanstack Query
Backend is tRPC, Drizzle ORM with SQLite

I used the create-t3-app to bootstrap the application:
```
pnpm create t3-app@latest
```

# Installation
install with your preferred node package manager

pnpm
```
pnpm install
```
npm
```
npm i
```
yarn
```
yarn 
```


# Testing
Mostly unit testing. Can be run via `pnpm test` or `pnpm test: watch`

### How it works

Make sure you have a `DATABASE_URL` in your .env file. However  it will default to a db if one is not given.

Pre startup:
pnpm install
pnpm db:generate
pnpm db:migrate

to seed the database with the initial date:

pnpm db:seed

and then you can start the project with:

pnpm dev


And voila!


# Future improvements:
Inclue componenet testing and E2E testing for the app
add verbose logging to better debug and troubleshoot the app
Improve the pagination logic. the load. more UX is not as smooth as I would like
Better decoupling of the query client from the react code.
Componentize the new-video page.
the isLoading logic for images can be improved, using a skeleton in place before loading the iage would be an enhanced experience for users.