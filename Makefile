# HealthPlus - Development Commands

.PHONY: help start stop test test-backend test-frontend clean

COMPOSE = docker compose --project-name alakin --file docker-compose.yml

# Default target
help:
	@echo "HealthPlus Development Commands:"
	@echo "  make start     - Start all services (backend, frontend, database)"
	@echo "  make stop      - Stop all services"
	@echo "  make test      - Run all tests (backend + frontend)"
	@echo "  make test-backend  - Run backend tests only"
	@echo "  make test-frontend - Run frontend tests only"
	@echo "  make clean     - Clean up containers and volumes"

# Start all services
start:
	@echo "   Starting All services..."
	$(COMPOSE) up -d
	@echo "   Services started!"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend API: http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

# Stop all services
stop:
	@echo "Stopping All services..."
	$(COMPOSE) down
	@echo "Services stopped!"

# Run all tests
test: test-backend test-frontend
	@echo "All tests completed!"

# Run backend tests
test-backend:
	@echo "Running backend tests..."
	$(COMPOSE) up -d postgres-test
	@sleep 3
	$(COMPOSE) exec backend python -m pytest src/tests/ -v
	$(COMPOSE) stop postgres-test
	@echo "Backend tests completed!"

# Run frontend tests
test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm run test:run
	@echo "Frontend tests completed!"

# Clean up everything
clean:
	@echo "Cleaning up containers and volumes..."
	$(COMPOSE) down -v
	docker system prune -f
	@echo "Cleanup completed!"
