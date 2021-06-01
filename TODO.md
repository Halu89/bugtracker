# TODOS

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

- [ ] Add authorization middlewares to the routes

- [ ] Add possibility to add/remove users from projects
- [ ] Add possibility to assign/remove users from issues


- [x] Unit tests
