# Quick Start Guide

## Project Documentation Index

This folder contains comprehensive documentation for the PHP Transcode Toolbox project:

### 📋 [Project Overview](./project-overview.md)
- **Purpose**: High-level understanding of the project
- **Topics**: Core problem solved, architecture overview, key features, project structure
- **For**: New team members, stakeholders, project managers

### ⚙️ [Technical Architecture](./technical-architecture.md)
- **Purpose**: Deep technical understanding of system design
- **Topics**: Application flow, backend/frontend architecture, database schema, security, performance
- **For**: Developers, architects, technical leads

### 👨‍💻 [Development Guide](./development-guide.md)
- **Purpose**: Practical development workflow and best practices
- **Topics**: Setup instructions, code organization, adding features, testing, debugging, deployment
- **For**: Developers working on the codebase

### 📚 [API Reference](./api-reference.md)
- **Purpose**: Complete API documentation for integration
- **Topics**: All endpoints, WebSocket events, error handling, configuration objects
- **For**: Frontend developers, API consumers, integrators

### 🤖 [Skills and Agents Proposal](./skills-and-agents-proposal.md)
- **Purpose**: Recommended expertise and automated agents for project development
- **Topics**: Specialized skills, agent workflows, implementation priority, ROI analysis
- **For**: Project managers, team leads, AI implementation planning

### 🎨 [Frontend Philosophy](./frontend-philosophy.md)
- **Purpose**: **CRITICAL** - Project's commitment to vanilla web development
- **Topics**: Zero-framework approach, vanilla web components, performance benefits, implementation patterns
- **For**: All developers - **READ THIS FIRST** before any frontend development

## Quick Reference

### 🚀 Getting Started
1. **Clone and Setup**:
   ```bash
   git clone <repository>
   cd php-transcode
   cp .env.example .env
   ./run  # Start Docker containers
   ```

2. **Access Application**: Open http://localhost:8078

3. **Development**: `vendor/bin/sail npm run watch` for live asset compilation

### 🎯 Core Functionality
- **Video Processing**: Transcode, concat, scale, crop videos
- **Hardware Acceleration**: VAAPI support for Intel/AMD GPUs
- **Real-time Updates**: WebSocket-based progress tracking
- **File Management**: Secure file picker with access controls
- **Clip Editor**: Frame-perfect cutting interface
- **Vanilla Frontend**: Pure web components, NO frameworks (Vue.js, React, etc.)

### 🏗️ Key Technologies
- **Backend**: Laravel 12.0 + PHP 8.3 + SQLite
- **Frontend**: Vanilla JS + Web Components + Laravel Echo
- **Video**: FFmpeg + Hardware acceleration
- **Deployment**: Docker + Docker Compose

### 📁 Important Directories
- `app/Http/Controllers/` - API endpoints
- `app/Models/FFMpeg/` - Video processing logic
- `resources/js/components/` - Vanilla web components (NO frameworks)
- `config/transcode.php` - Codec configurations

### 🔧 Common Tasks

#### Adding New Video Operation
1. Create Action class in `app/Models/FFMpeg/Actions/`
2. Add controller method and route
3. Update ProcessVideo job handling
4. Create frontend dialogue component
5. Add to tools dropdown

#### Debugging FFmpeg Issues
1. Check `storage/logs/laravel.log` for errors
2. Enable Xdebug: `SAIL_XDEBUG_MODE=develop,debug` in `.env`
3. Monitor queue: `php artisan queue:failed`
4. Test commands manually in container

#### Performance Optimization
1. Enable hardware acceleration in `.env`
2. Monitor queue processing: `php artisan queue:monitor`
3. Check GPU access: `ls -la /dev/dri/renderD128`
4. Profile with browser dev tools

### 🚨 Common Issues & Solutions

#### FFmpeg Hardware Acceleration Not Working
- Check GPU device permissions in container
- Verify `VAAPI_DEVICE` environment variable
- Test FFmpeg command manually: `ffmpeg -vaapi_device /dev/dri/renderD128`

#### Large File Processing Timeout
- Increase job timeout in `ProcessVideo.php`
- Monitor memory usage in Docker container
- Consider splitting large files into smaller chunks

#### WebSocket Connection Issues
- Verify Pusher configuration in `.env`
- Check Laravel Echo configuration
- Ensure proper WebSocket port access

### 📞 Getting Help

1. **Check Logs**: `vendor/bin/sail tail -f storage/logs/laravel.log`
2. **Review Documentation**: Start with relevant section above
3. **Debug Commands**: Use `php artisan tinker` for backend testing
4. **Frontend Debug**: Use browser dev tools for component issues

## Project Health Checklist

### ✅ Pre-Development
- [ ] Docker environment running (`./run`)
- [ ] Environment variables configured (`.env`)
- [ ] GPU access verified (for hardware acceleration)
- [ ] Test media files available in configured directory

### ✅ During Development
- [ ] Code follows project conventions
- [ ] Tests written for new functionality
- [ ] WebSocket events properly handled
- [ ] Error handling implemented
- [ ] Progress tracking added for long operations
- [ ] **Vanilla frontend compliance** - NO frameworks used
- [ ] **Web Components API** - Native component implementation
- [ ] **Direct browser APIs** - No unnecessary abstractions

### ✅ Before Deployment
- [ ] All tests passing (`vendor/bin/sail php artisan test`)
- [ ] Assets compiled for production (`npm run production`)
- [ ] Environment variables set for production
- [ ] Security review completed
- [ ] Performance testing conducted
- [ ] **Bundle size optimization** - Minimal JavaScript
- [ ] **Browser compatibility** - Native API usage verified

---

**Tip**: Bookmark this document as your starting point for any project-related questions or development tasks. Each section contains links to more detailed documentation.