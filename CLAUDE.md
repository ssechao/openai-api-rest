# CLAUDE.md - Assistant Development Guide

## Project Overview

This is a web proxy API project using Puppeteer to expose website functionalities as REST API endpoints. The project is for educational purposes only.

## Key Technical Details

### Architecture
- **Framework**: Express.js with TypeScript
- **Web Automation**: Puppeteer with stealth plugin
- **Containerization**: Docker with proper Chrome dependencies
- **Testing**: Jest for unit and integration tests
- **Logging**: Winston for structured logging

### Project Structure
- `src/controllers/` - API endpoint handlers
- `src/services/` - Business logic and Puppeteer operations
- `src/middleware/` - Express middleware (auth, validation, error handling)
- `src/routes/` - Route definitions
- `src/utils/` - Helper functions
- `src/config/` - Configuration management

### Development Commands
```bash
npm run dev         # Start development server with nodemon
npm run build       # Build TypeScript to JavaScript
npm run test        # Run tests
npm run lint        # Run ESLint
npm run typecheck   # Check TypeScript types
```

## Implementation Guidelines

### When Adding New Features

1. **API Endpoints**: Create controller in `src/controllers/`, add route in `src/routes/`
2. **Puppeteer Operations**: Implement in `src/services/browser.service.ts` or create new service
3. **Validation**: Use Joi schemas in middleware
4. **Error Handling**: Use custom error classes and centralized error middleware

### Puppeteer Best Practices

1. Always use try-finally to ensure browser cleanup
2. Implement page pooling for performance
3. Use stealth plugin to avoid detection
4. Set appropriate timeouts and viewport sizes
5. Handle navigation errors gracefully

### Code Style

- Use async/await for asynchronous operations
- Implement proper error types
- Use dependency injection pattern
- Keep controllers thin, logic in services
- Write tests for critical paths

### Security Considerations

1. Validate and sanitize all inputs
2. Implement rate limiting
3. Use environment variables for sensitive config
4. Run Puppeteer with minimal privileges
5. Implement request timeouts

## Common Tasks

### Adding a New Proxy Endpoint

1. Define interface in `src/types/`
2. Create service method in `src/services/`
3. Create controller in `src/controllers/`
4. Add route in `src/routes/`
5. Add validation middleware
6. Write tests

### Debugging Puppeteer Issues

- Set `PUPPETEER_HEADLESS=false` for visual debugging
- Use `page.screenshot()` for debugging states
- Check Chrome process limits
- Monitor memory usage

### Docker Considerations

- Chrome requires specific system dependencies
- Use non-root user for security
- Mount volumes for logs
- Set appropriate resource limits

## Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Mock Puppeteer for unit tests
- Use real browser for integration tests

## Performance Optimization

- Implement connection pooling
- Cache frequently accessed data
- Use CDN for static assets
- Implement request queuing
- Monitor and limit concurrent sessions

## Monitoring and Logging

- Log all API requests and responses
- Track Puppeteer session metrics
- Monitor memory and CPU usage
- Implement health checks
- Set up alerts for errors

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Docker image optimized
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Health checks working
- [ ] Resource limits set
- [ ] Security headers enabled
- [ ] Error handling tested