# Name of the Docker image
IMAGE_NAME = comments-api
# Port mapping for the container
PORT = 3000

# Default target: Build the Docker image
.PHONY: all
all: build

# Build the Docker image
.PHONY: build
build:
	docker build -t $(IMAGE_NAME) .

# Authenticate Docker to ECR
authenticate:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 905418031675.dkr.ecr.us-east-1.amazonaws.com

# Tag Docker Image
tag:
	docker tag comments-api:latest 905418031675.dkr.ecr.us-east-1.amazonaws.com/rilla/project1:latest

#Push the image to ECR
push:
	docker push 905418031675.dkr.ecr.us-east-1.amazonaws.com/rilla/project1:latest

# Run the Docker container
.PHONY: run
run:
	docker run	\
		-p $(PORT):$(PORT)	\
		-v ~/.aws:/root/.aws	\
		$(IMAGE_NAME)

# Stop and remove the Docker container (if running)
.PHONY: stop
stop:
	docker stop $(IMAGE_NAME) || true
	docker rm $(IMAGE_NAME) || true

# Remove the Docker image
.PHONY: clean
clean: stop
	docker rmi $(IMAGE_NAME)
