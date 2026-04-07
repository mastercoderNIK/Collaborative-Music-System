# Collaborative-Music-Playing-System

A full-stack collaborative music streaming web application that allows users to listen to YouTube music together in real-time. Built as part of my B.Tech final year project at SRM Institute of Science and Technology.

DNA Music System solves a simple problem — there is no easy way for a group of friends to listen to the same song at the same time, from different locations, without screen sharing or expensive subscriptions.


This platform lets users create or join groups, and the group leader controls playback for everyone. Every member hears the same song at the same timestamp, with live chat and a voting system to decide what plays next — all in the browser, no app install needed.

## Features

 AWS Cognito Authentication — Secure sign up / login via OAuth 2.0 with JWT token verification
 
 YouTube Playback — Search, play, and get recommendations powered by YouTube Data API v3 and the YouTube IFrame Player API
 
 Group Sync — Create a group, share a token, and all members stay in sync with the leader's playback via Socket.IO WebSockets
 
 Live Group Chat — Real-time messaging within each group session
 
 Voting System — Members vote to skip, replay, like or dislike. 60% threshold auto-triggers the action
 
 Admin Panel — Manage users, groups, and feedback from a dedicated admin dashboard


Search — Queries YouTube Data API v3 for music videos based on user search input

Trending — Fetches region-based trending music videos on dashboard load

Recommendations — Since relatedToVideoId is deprecated, the app extracts the current track title, cleans it, and performs a fresh search query to get relevant recommendations

Playback — Uses the YouTube IFrame Player API in the frontend to embed and control video playback programmatically (loadVideoById, seekTo, getCurrentTime)


All YouTube responses are normalised into a consistent { videoId, title, channel, thumbnail } format before reaching the frontend.

## Tech Stack
Frontend — React 18, Vite, Socket.IO Client, CSS Variables

Backend — Python, Flask, Flask-SocketIO (eventlet), SQLAlchemy, PyJWT

Database — PostgreSQL

Auth — AWS Cognito 

Infrastructure — AWS, Docker, AWS EKS, Jenkins CI/CD, Terraform

## Containerization
The application is split into two Docker images, both available on Docker Hub:

### Frontend
docker pull dockerayush039/sepmfront

The frontend uses a multi-stage build — Stage 1 compiles the React app using Node.js, Stage 2 copies the static output into an nginx:alpine container. The nginx config also proxies /api/ and /socket.io/ requests to the backend service internally.

### Backend

docker pull dockerayush039/sepmback

The backend runs Flask with eventlet on port 5000. All secrets (database URL, API keys, Cognito config) are injected at runtime via Kubernetes Secrets — nothing sensitive is baked into the image.

## Deployment on AWS EKS

The application is deployed on an Amazon EKS cluster (ap-south-1) using Helm as the package manager for Kubernetes resources.

## Deployment for frontend (nginx+React) and backend (Flask) with 2 replicas each

StatefulSet for PostgreSQL with a persistent EBS volume (PVC)

ClusterIP Services for internal pod-to-pod communication

Ingress using the Nginx Ingress Controller with sticky session annotations for Socket.IO

Kubernetes Secrets for backend environment variables

---

## CI/CD Pipeline — Jenkins

A Jenkins pipeline automates the full build and deployment process. Every push to the `main` branch triggers the pipeline via a GitHub webhook.SK_ENVproduction
