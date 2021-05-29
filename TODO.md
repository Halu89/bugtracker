# TODOS

- [x] Create the project model, and update the issue and user models to add refs to it

- [] Add hooks to the models to propagate changes

  - [] To the Issue model
    - [x] on save
    - [x] on findByIdAndDelete
    - [] on deleteMany (when we delete a project)
  - [x] To the Project model
    - [x] on save
    - [x] on findByIdAndDelete

- Add possibility to add/remove users from projects
- Add possibility to assign/remove users from issues

- Add verify author/admin middlewares to the routes

- [x] Unit tests
