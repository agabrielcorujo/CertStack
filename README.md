# CertStack
Quizlet-like platform for studying for professional certification/licensing exams, focused on but not limited to state regulated licensing (i.e. Bar Exam, USLME, CPA, etc). 

## Contributing

Thanks for your interest in contributing to **CertStack**! To keep development smooth and avoid merge conflicts, please follow the workflow below.

### Branching Strategy

CertStack uses a structured branching workflow:

- `prod` — stable production branch
- `testing` — integration and pre-release testing
- `feature/*` — individual feature or fix branches

### How to Contribute

1. **Create a feature branch from `testing`**
   ```bash
   git checkout testing
   git pull origin testing
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Commit early and often with clear messages.
   - Keep commits focused and scoped.

3. **Sync with `testing` before merging**
   
   Before opening a merge into `testing`, pull the latest changes to avoid conflicts:
   ```bash
   git checkout testing
   git pull origin testing
   git checkout feature/your-feature-name
   git merge testing
   ```

   Resolve any conflicts locally before continuing.

4. **Merge your feature into `testing`**
   - Open a pull request from your `feature/*` branch into `testing`
   - Ensure all checks pass before merging

5. **Automatic Promotion to Production**
   
   Once your feature is merged into `testing`, a GitHub Actions workflow will automatically:
   - Run tests
   - Open a pull request from `testing` into `prod` if tests pass

   No manual PR to `prod` is required.

### Notes

- Avoid force pushes on shared branches
- Keep feature branches short-lived when possible

Following this process ensures a clean history, fewer conflicts, and a reliable release pipeline.

