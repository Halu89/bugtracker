# Bugtracker API

This API allows you to create a project and manage issues and bugs

The API is not yet publically available.
The api accepts data in Json or as form data.

---

## API Authentication

### If you are not registered

To submit or view an order, you need to register an account.

POST `/auth/signup`

The request body needs to include the following properties:

- `username` - String
- `email` - String
- `password` - String

Example

```
   POST /auth/signup

{
   "username": "SantaKlaus",
   "email": "redmanwithabeard@northpole.no"
   "password": "Be4G00dB0y"
}
```

### If you already registered

POST `/auth/signin`

The request body needs to include the following properties:

- `username` - String
- `password` - String

# Endpoints

All of those endpoints are protected by JWT.

Include in your headers

```
Authorization: Bearer <YOUR TOKEN>
```

---

## Projects

### List of projects

GET `/projects`

Returns the list of the projects you're a part of.

### Get a single project details

GET `/projects/:projectId/details`

Retrieve detailed information about a project.

Response :

```
{
    _id: projectId,
    name: String,
    description: String,
    author: user,
    team: [
      { _id, username, email},
      ],
    admins: [
      { _id, username, email},
      ],
    issues: [
      { _id, title},
      ],
    createdAt: Date,
    updatedAt: Date,
}
```

### Create a project

POST `/projects`

Allows you to create a new project.
The request body needs to include the following properties:

- `name` - String
- `description` - String

Example

```
POST /projects
Authorization: Bearer <YOUR TOKEN>

{
  "name": "Santa factory",
  "description": "Where all the little elves work to bring joy around the world.",
}
```

### Update a project

You need to be the author or an admin of a project to be authorized.

PUT `/projects/:projectId`

Update an existing project.

The request allows you to update the following properties:

- `name` - String
- `description` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a
Authorization: Bearer <YOUR TOKEN>

{
  "name": "Santa factory !",
  "description": "Where all the elves work to bring joy and happiness around the world.",
}
```

### Delete a project

You need to be the author or an admin of a project to be authorized.

DELETE `/projects/:projectId`

Delete an existing project.

Example

```
DELETE /projects/60b0ff873b7570331c240b7a
Authorization: Bearer <YOUR TOKEN>
```

## Project Management

You need to be the author or an admin of a project to be authorized.

### Add a user to a project's team

PUT `/projects/:projectId/addUser`

Include the username in the body

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/addUser
Authorization: Bearer <YOUR TOKEN>

{
  "username": "Rudolph",
}
```

### Remove a user from a project's team

PUT `/projects/:projectId/removeUser`

Include the username in the body

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/removeUser
Authorization: Bearer <YOUR TOKEN>

{
  "username": "Rudolph",
}
```

### Add a user to a project's admins

PUT `/projects/:projectId/addAdmin`

Include the username in the body

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/addAdmin
Authorization: Bearer <YOUR TOKEN>

{
  "username": "Rudolph",
}
```

### Remove a user from a project's admins

PUT `/projects/:projectId/removeAdmin`

Include the username in the body

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/removeAdmin
Authorization: Bearer <YOUR TOKEN>

{
  "username": "Rudolph",
}
```

---

## Issues

### List of issues

GET `projects/:projectId/`

Returns the list of issues of that project .

### Get a single issue

GET `/projects/:projectId/:issueId`

Retrieve detailed information about an issue.

```
{
    _id: issueId,
    title: String,
    description: String,
    project: projectId ,
    author: {_id, username, email},
    assignedTo: [
      {_id, username, email_},
      ],
    statusText: String,
    isOpen: Boolean,
    createdAt: Date,
    updatedAt: Date,
}
```

### Create an issue

POST `/projects/:projectId/`

Allows you to create a new issue.
The request body needs to include the following properties:

- `title` - String

Example

```
POST /projects/60b0ff873b7570331c240b7a/
Authorization: Bearer <YOUR TOKEN>

{
  "title": "We need more cookies !",
}
```

### Update an issue

PUT `/projects/:projectId/:issueId`

Update an existing issue.

The request allows you to update the following properties:

- `title` - String
- `description` - String
- `statusText` - String
- `isOpen` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
Authorization: Bearer <YOUR TOKEN>

{
    title: "Thanks !",
    description: "They were really good.",
    statusText: "We might hit you up for some more later.",
    isOpen: false,
}
```

### Delete an issue

DELETE `/projects/:projectId/:issueId`

Delete an existing issue. Need to be a project admin

Example

```
DELETE /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
Authorization: Bearer <YOUR TOKEN>
```

### Assign an issue

PUT `/projects/:projectId/:issueId/assignUser`

Assign a user to an existing issue.
You need to be a project admin or you can only assign yourself.
The request expects a username:

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5/assignUser
Authorization: Bearer <YOUR TOKEN>

{
    username: "Rudolph"
}
```

### Unassign an issue

PUT `/projects/:projectId/:issueId/assignUser`

Unassign a user to an existing issue.
You need to be a project admin or you can only remove yourself.
The request expects a username:

- `username` - String

Example

```
PUT /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5/unassignUser
Authorization: Bearer <YOUR TOKEN>

{
    username: "Rudolph"
}
```
