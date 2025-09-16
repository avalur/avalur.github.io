# Project Issues

## Current Technical Debt and Improvements

- [ ] **Remove ancient dependency and replace with proper editor**
    - Replace dependency on the ancient Hoep fork (https://github.com/pacahon/Hoep.git)
    - Ideally replace with a proper editor solution
    - Ivan added an editor component based on tiptap/prosemirror, but it's currently only used for editing info block pages
    - **Action items:**
        - Replace the editor in all other places
        - (only for prod) Migrate old data to a new format

- [ ] **Save filters on assignment list pages**
    - Implement filter persistence for both students and teachers
    - Currently, filters reset when page is refreshed
    - This feature has been requested multiple times, so it's quite high priority

- [ ] **Add proper comment editing functionality**
    - Currently, clicking the edit button opens an ugly new page
    - Should allow inline editing directly in the interface
    - Improve user experience for comment management

#### Medium Priority Tasks

- [ ] **Mobile version and dark theme**
    - Implement responsive mobile design
    - Add dark theme support
    - Improve overall accessibility

- [ ] **Upgrade Bootstrap version**
    - Currently, using Bootstrap 3 for most of the interface
    - Upgrade to at least Bootstrap 5
    - Update components accordingly

#### Infrastructure Improvements

- [ ] **Replace package manager**
    - Move from pipenv to poetry/uv
    - The current pipenv is old, doesn't support standard pyproject.toml, and very slow
    - Modernize dependency management

- [ ] **Improve React development experience**
    - Currently using webpack with broken development mode
    - Fix development mode at minimum
    - Consider alternative build tools/bundlers

- [ ] **Automated testing in CI**
    - Set up automatic test execution in continuous integration
    - Ensure code quality and prevent regressions
