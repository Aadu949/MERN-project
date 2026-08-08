pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t aadu949/mern-server:latest ./server'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t aadu949/mern-client:latest ./client'
            }
        }

        stage('Docker Hub Login') {
            steps {
                sh 'echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin'
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push aadu949/mern-server:latest'
                sh 'docker push aadu949/mern-client:latest'
            }
        }
    }

    post {
        success {
            echo 'MERN Docker images built and pushed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
