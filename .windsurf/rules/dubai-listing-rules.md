---
trigger: always_on
---

Project Rules and Guidelines for Dubai-Listings API

1. Code Style & Formatting
   Use 2 spaces for indentation (no tabs)
   Use single quotes for strings
   Use camelCase for variables and functions
   Use PascalCase for classes and constructors
   Always include semicolons
   Maximum line length: 100 characters
   Use ES6+ features (async/await, destructuring, etc.)
2. Git Workflow
   Branch naming: feature/feature-name, bugfix/description, hotfix/description
   Commit messages: Use conventional commits
   feat: for new features
   fix: for bug fixes
   docs: for documentation changes
   refactor: for code refactoring
   test: for test-related changes
   chore: for build/configuration updates
   Always pull before pushing
   Never commit sensitive data (API keys, credentials)
   Keep commits atomic and focused
3. API Design
   Use RESTful conventions
   Use kebab-case for URLs
   Use camelCase for JSON properties
   Version your API (e.g., /api/v1/...)
   Always return consistent response format:
   json
   CopyInsert
   {
   "success": true/false,
   "data": {},
   "error": "Error message if any"
   }
4. Security
   Use environment variables for all sensitive data
   Validate all user input using Joi
   Sanitize user input to prevent NoSQL/query injection
   Use Helmet middleware for security headers
   Implement rate limiting
   Use HTTP-only cookies for JWT storage
   Enable CORS only for trusted origins
5. Error Handling
   Use custom error classes
   Implement global error handling middleware
   Log all errors appropriately
   Don't expose stack traces in production
   Use proper HTTP status codes:
   200: OK
   201: Created
   400: Bad Request
   401: Unauthorized
   403: Forbidden
   404: Not Found
   500: Internal Server Error
6. Testing
   Write unit tests for all controllers and services
   Write integration tests for all API endpoints
   Aim for at least 80% test coverage
   Run tests before pushing code
   Mock external services in tests
   Use test.only and test.skip temporarily
7. Documentation
   Document all API endpoints using Swagger/OpenAPI
   Include request/response examples
   Document all environment variables
   Keep README.md up to date
   Add comments for complex logic
   Document API rate limits and quotas
8. Dependencies
   Keep dependencies up to date
   Audit dependencies regularly
   Document reason for each dependency
   Prefer smaller, focused packages
   Review new dependencies before adding
9. Performance
   Implement pagination for large datasets
   Use indexes for frequently queried fields
   Implement caching where appropriate
   Optimize database queries
   Use connection pooling
10. Deployment
    Use environment-specific configuration
    Implement health check endpoints
    Set up proper logging
    Implement monitoring
    Have rollback strategy
11. Code Review
    All code must be reviewed before merging
    At least one approval required
    Address all review comments
    Keep PRs small and focused
    Include relevant tests
12. Branch Protection
    Protect main branch
    Require pull request before merging
    Require status checks to pass
    Require linear history
    Restrict who can push to main
13. Commit Message Format
    CopyInsert
    <type>(<scope>): <subject>
    <BLANK LINE>
    [optional body]
    <BLANK LINE>
    [optional footer]
    Example:

CopyInsert
feat(auth): add JWT authentication

- Implement JWT token generation
- Add login/signup endpoints
- Add authentication middleware

Closes #123 14. Linting
Run linter before committing
Fix all linting errors
Don't disable linter rules without justification 15. Environment Variables
Document all environment variables in .env.example
Never commit .env files
Set required variables in production
Validate environment variables on startup 16. Logging
Use structured logging
Include request IDs
Log at appropriate levels:
error: system failures
warn: handled exceptions
info: important business events
debug: debugging information
trace: detailed debugging 17. API Versioning
Version all API endpoints
Support at least one previous version
Document deprecation policy 18. Monitoring
Monitor application health
Set up error tracking
Monitor performance metrics
Set up alerts 19. Security Headers
Implement CSP
Set security headers
Use secure cookies
Enable HSTS 20. Documentation Updates
Update documentation with code changes
Keep API documentation in sync
Document breaking changes
Include examples 21. Code Organization
Keep controllers thin
Put business logic in services
Keep models clean
Group related functionality 22. Error Messages
Be descriptive
Don't expose sensitive information
Be consistent
Include error codes 23. API Design
Use nouns for resources
Use HTTP methods appropriately
Support filtering, sorting, pagination
Use proper status codes 24. Testing
Write testable code
Use test doubles appropriately
Test edge cases
Test error conditions 25. Performance
Optimize database queries
Use indexes appropriately
Implement caching
Monitor performance 26. Security
Validate all input
Sanitize output
Use parameterized queries
Implement proper authentication 27. Documentation
Document all public APIs
Include examples
Document error responses
Keep documentation up to date 28. Code Review
Review for security issues
Check for performance problems
Ensure code follows style guide
Verify tests exist 29. Deployment
Use CI/CD
Automate deployments
Have rollback plan
Monitor deployments 30. Monitoring
Monitor application health
Set up alerts
Monitor performance
Track errors
These rules should help maintain code quality, security, and consistency throughout the project.
