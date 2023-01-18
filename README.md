# CRUD_API

CRUD API with an in-memory database underneath

## Install

1. Clone repository to your computer.
   > git clone https://github.com/ElenaBezro/CRUD_API.git
2. Change directory.
   > cd CRUD_API
3. Switch to the `dev` branch.
   > git checkout dev
4. Install dependencies.
   > npm i

## Start

- `npm run start:dev` - to start in development mode.
- `npm run start:prod` - to build and start in production mode.
- `npm run start:multi` - to start in load balancer mode.

## API

**GET** _api/users_ - to get all users

**GET** _api/users/${userId}_ - to get user by id (uuid)

**POST** _api/users_ - to create record about new user and store it in database

**PUT** _api/users/${userId}_ - to update existing user

**DELETE** _api/users/${userId}_ - to delete existing user from database

Request body to stringify example:
**all fields required**

````
{
  username: "Mike",
  age: 40,
  hobbies: [
    "video games", 'cooking'
  ]
}
````
