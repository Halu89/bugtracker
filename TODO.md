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
- [ ] Add verify author/admin middlewares to the routes
- [ ] Add documentation

- [ ] Add possibility to add/remove users from projects
- [ ] Add possibility to assign/remove users from issues


- [x] Unit tests
