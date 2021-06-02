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
{
   "username": "Valentin",
   "email": "valentin@example.com"
   "password": "secret"
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
> Not implemented atm

GET `/projects/details`

Retrieve detailed information about a project.

```
{
    _id: projectId,
    name: String,
    description: String,
    author: userId,
    team: [userId],
    admins: [userId],
    issues: [issueId],
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
DELETE /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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
    author: userId,
    assignedTo: [userid],
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
POST /projects/:projectId/
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
PATCH /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
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

Delete an existing issue.

Example

```
DELETE /projects/60b0ff873b7570331c240b7a/PF6MflPDcuhWobZcgmJy5
Authorization: Bearer <YOUR TOKEN>
```
