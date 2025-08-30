#!/bin/bash

# Complete System Startup Script
# Starts all components of the hydrogen infrastructure system

set -e

echo "🚀 Starting Hydrogen Infrastructure System..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required services are running
check_dependencies() {
    print_status "Checking system dependencies..."
    
    # Check MongoDB
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB not running. Starting MongoDB..."
        if command -v brew &> /dev/null; then
            brew services start mongodb-community
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start mongod
        else
            print_error "Please start MongoDB manually"
            exit 1
        fi
    else
        print_success "MongoDB is running"
    fi
    
    # Check Redis
    if ! pgrep -x "redis-server" > /dev/null; then
        print_warning "Redis not running. Starting Redis..."
        if command -v brew &> /dev/null; then
            brew services start redis
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start redis
        else
            print_error "Please start Redis manually"
            exit 1
        fi
    else
        print_success "Redis is running"
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    else
        print_success "Node.js is available"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    else
        print_success "Python 3 is available"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_success "Frontend dependencies installed"
    fi
    
    # ML service dependencies
    if [ -d "project" ]; then
        print_status "Installing ML service dependencies..."
        cd project
        if [ ! -d "myvenv" ]; then
            python3 -m venv myvenv
        fi
        source myvenv/bin/activate
        pip install -r requirements.txt
        cd ..
        print_success "ML service dependencies installed"
    fi
}

# Start ML service
start_ml_service() {
    print_status "Starting ML service..."
    cd project
    
    # Activate virtual environment
    source myvenv/bin/activate
    
    # Start the ML API service
    python main.py &
    ML_PID=$!
    echo $ML_PID > ../ml_service.pid
    
    cd ..
    
    # Wait for ML service to start
    sleep 5
    
    # Check if ML service is running
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "ML service started successfully (PID: $ML_PID)"
    else
        print_error "Failed to start ML service"
        exit 1
    fi
}

# Start backend service
start_backend() {
    print_status "Starting backend service..."
    cd backend
    
    # Start the backend service
    npm run dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait for backend to start
    sleep 10
    
    # Check if backend is running
    if curl -s http://localhost:5000/health > /dev/null; then
        print_success "Backend service started successfully (PID: $BACKEND_PID)"
    else
        print_error "Failed to start backend service"
        exit 1
    fi
}

# Start frontend service
start_frontend() {
    print_status "Starting frontend service..."
    cd frontend
    
    # Start the frontend service
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
    
    # Wait for frontend to start
    sleep 15
    
    # Check if frontend is running
    if curl -s http://localhost:3001 > /dev/null; then
        print_success "Frontend service started successfully (PID: $FRONTEND_PID)"
    else
        print_error "Failed to start frontend service"
        exit 1
    fi
}

# Run integration tests
run_tests() {
    print_status "Running integration tests..."
    
    # Wait a bit more for all services to be fully ready
    sleep 5
    
    if [ -f "test-integration.js" ]; then
        if node test-integration.js; then
            print_success "All integration tests passed!"
        else
            print_warning "Some integration tests failed, but services are running"
        fi
    else
        print_warning "Integration test script not found, skipping tests"
    fi
}

# Display service URLs
show_urls() {
    echo ""
    echo "🌐 Service URLs:"
    echo "=============================================="
    echo "Frontend:     http://localhost:3001"
    echo "Backend API:  http://localhost:3000"
    echo "ML Service:   http://localhost:8000"
    echo "Health Check: http://localhost:3000/health"
    echo "API Docs:     http://localhost:3000/api"
    echo ""
    echo "📊 Interactive Map: http://localhost:3001/mapping/interactive"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Shutting down services..."
    
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null || true
        rm frontend.pid
    fi
    
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null || true
        rm backend.pid
    fi
    
    if [ -f "ml_service.pid" ]; then
        kill $(cat ml_service.pid) 2>/dev/null || true
        rm ml_service.pid
    fi
    
    print_success "Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    case "${1:-start}" in
        "start")
            check_dependencies
            install_dependencies
            start_ml_service
            start_backend
            start_frontend
            run_tests
            show_urls
            
            print_success "🎉 All services are running!"
            print_status "Press Ctrl+C to stop all services"
            
            # Keep script running
            while true; do
                sleep 1
            done
            ;;
        "stop")
            cleanup
            ;;
        "test")
            if [ -f "test-integration.js" ]; then
                node test-integration.js
            else
                print_error "Integration test script not found"
                exit 1
            fi
            ;;
        "status")
            echo "Service Status:"
            echo "=============="
            
            if curl -s http://localhost:8000/health > /dev/null; then
                print_success "ML Service: Running"
            else
                print_error "ML Service: Not running"
            fi
            
            if curl -s http://localhost:3000/health > /dev/null; then
                print_success "Backend: Running"
            else
                print_error "Backend: Not running"
            fi
            
            if curl -s http://localhost:3001 > /dev/null; then
                print_success "Frontend: Running"
            else
                print_error "Frontend: Not running"
            fi
            ;;
        "help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start    Start all services (default)"
            echo "  stop     Stop all services"
            echo "  test     Run integration tests"
            echo "  status   Check service status"
            echo "  help     Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  SKIP_TESTS=1    Skip integration tests on startup"
            echo "  DEV_MODE=1      Start in development mode"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"