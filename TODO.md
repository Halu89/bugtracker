- [x] Create the project model, and update the issue and user models to add refs to it

- [x] Add hooks to the models to propagate changes

  - [x] To the Issue model

    - [x] on save
    - [x] on findByIdAndDelete

  - [x] To the Project model
    - [x] on save
    - [x] on findByIdAndDelete
      - [x] For the users
      - [x] For the issues

- [x] Create Project routes and controllers

- [x] Actually delete the issues related to a project when a project is deleted
- [x] Test that a project exists before creating an issue on it
- [x] Add documentation

- [x] Add authorization middlewares to the routes

- [x] Add possibility to add/remove users and admins from projects
- [x] Add possibility to assign/remove users from issues
- [x] Reorganize the permission checking middleware, and add project to the request to avoid unnecessary db calls.

- [x] Restrict issue assignments to team members or automatically add the user to the team
- [x] Unit tests

- [ ] Finish postman tests with the teams, admins, and issue assignments.
- [ ] Redo the issues and projects array on the user model so they store a ref to all the issues and projects the user has access to.
- [ ] Only allow updates if user is assigned to an issue or an admin
